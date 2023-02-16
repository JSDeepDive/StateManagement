/**
 * **********************************************************************
 * Step1
 * (v1) DOM 조작과 이벤트 핸들링으로 메뉴 CRUD
 * (v2) 이벤트 위임 적용한 메뉴 CRUD
 * - form 요소의 상위 submit 이벤트로 하위 요소의 click, keyup 이벤트 처리
 * - 상위 ul 요소에 하위 수정/삭제 button 요소의 이벤트 위임
 * - [!] 이벤트 핸들러 중복 등록 이슈 발생
 * (v3) DOM 요소 조정 과정 추상화한 React 환경 모방
 * - (1) 인자로 받은 값으로 기존 상태를 업데이트 시키는 코드 setStaet 함수로 추상화
 * - (2) 상태 변화에 맞게 사용자에게 보여질 DOM 요소 조정 코드 render 함수로 추상화
 * - 이벤트 등록 함수 render 외부로 분리해 중복 등록 이슈 해결
 * **********************************************************************
 */

/**
 * **********************************************************************
 * Step2
 * [v] localStorage에 데이터를 저장하여 새로고침해도 데이터가 남아있게 한다.
 * [v] 에스프레소, 프라푸치노, 블렌디드, 티바나, 디저트 각각의 종류별로 메뉴판을 관리할 수 있게 만든다.
 * [v] 페이지에 최초로 접근할 때는 에스프레소 메뉴가 먼저 보이게 한다.
 * [v] 품절 상태인 경우를 보여줄 수 있게, 품절 버튼을 추가하고 sold-out class를 추가하여 상태를 변경한다.
 * (v2) redux 모방해 상태 관리로 메뉴 관리하기
 * - createStore 메서드 통해 전역 상태 관리에 사용할 dispatch, subscribe, getState 메서드를 가진 객체 store 반환
 * - 메뉴 추가/업데이트/삭제/메뉴 품절 여부 표시 이벤트 핸들러의 setState를 store.dispatch(actionCreator(type, payload)) 형태로 수정
 * - 즉, 메뉴 관련 이벤트가 발생하면, actionCreator가 action 객체를 만들어 반환하여 dispatch에 전달
 * - store의 dispatch 메서드에서는 reducer에게 상태 변화를 위임함
 * - reducer(state, action)는 순수함수로 구현
 * - reducer 내부에서 상태를 직접 변경하지 않고, 기존 상태를 복제한 뒤 변경 사항을 반영하여 해당 객체를 반환하도록 해 불변성 유지함
 * - 따라서 실제 상태 변경은 store 내부에서만 발생하도록 제약함
 * - 상태 변경 시마다 localStorage에 신규 상태가 반영되고, 리렌더링이 일어날 수 있도록 해당 메서드들을 store.subscribe(메서드)에 전달함
 * - store의 상태에 접근해야 할 때, 항상 store.getState() 메서드를 통해 접근
 * **********************************************************************
 */

// NOTION KEYWORD
// 카테고리 명칭 상수화: 휴먼 에러 방지 - 실제 desert 사례
// 커링 함수: 지연 실행
// store 클로저로 state private으로 구현
// state가 최대 2 layer까지만 권장되는 까닭? ... spread 연산자 vs deepcopy(immutable.js)
// globalState, ComponentState 변경이 요소 전체가 리렌더링으로 이어질 수 밖에 없는 까닭? state, props, useReducer

// REFACTOR
// TODO 커링 함수로 변경: 지연 실행
// TODO const로 선언하면 블록 내에서 같은 변수명 재사용 불가 -> 클린 코드?
// TODO reducer는 디폴트값으로 initialState받을 때, localStorage를 연결하는게 맞을까?
// TODO 최대한 Flat하게 state를 변경하거나 immutable.js 사용하거나 deepcopy 수행하는 코드로 변경하기
// TODO updateTotal, updateTitle에서 DOM 직접조작 하지 않도록 렌더링 로직 분리하기(추상화 할 때 적용하기)

/**
 * MENU_CATEGORIES: 카테고리 명칭
 */
const ESPRESSO = "espresso";
const FRAPPUCINO = "frappuccino";
const BLENDED = "blended";
const TEAVANA = "teavana";
const DESSERT = "dessert";

const $ = (selector) => document.querySelector(selector);

/**
 * componentState: 컴포넌트 내부에서 관리하는 상태
 */
let componentState = {
  tab: ESPRESSO,
};

/**
 * ACTION_TYPES: 액션 타입 명칭
 */
const INIT_MENU = "init-menu";
const ADD_MENU = "add-menu";
const UPDATE_MENU = "update-menu";
const REMOVE_MENU = "remove-menu";
const TOGGLE_MENU = "toggle-menu";

/**
 * @function actionCreator
 * @description type과 payload를 받아 action 객체를 반환하는 함수
 */
const actionCreator = (type) => (payload) => {
  return { type, payload };
};

/**
 * actionCreators
 */
const createInitAction = actionCreator(INIT_MENU);
const createAddAction = actionCreator(ADD_MENU);
const createUpdateAction = actionCreator(UPDATE_MENU);
const createRemoveAction = actionCreator(REMOVE_MENU);
const createToggleAction = actionCreator(TOGGLE_MENU);

/**
 * @function createStore
 * @param {function} reducer
 * @description 전역 상태관리를 수행하는 store 객체를 반환하는 함수.
 * 							store 객체에 dispatch, subscribe, getState 메서드만 반환하여, state 정보 은닉(클로저).
 * 							(1) dispatch(action): 특정 action이 발생했음을 알려, store에서 상태를 변경하도록 함.
 * 							(2) subscribe(callback): store에서 상태 변경이 수행된 후, 호출할 함수들을 전달함.
 * 							(3) getState(): store의 현재 상태를 반환함.
 */
const createStore = (reducer) => {
  let state;
  let callbacks = [];

  dispatch(actionCreator(INIT_MENU, {}));

  function dispatch(action) {
    // state 불변성 유지. state는 오직 store 내에서만 변경 가능.
    state = reducer(state, action);
    // state 변경 시마다 등록된 콜백함수들 동기적으로 호출
    callbacks.forEach((callback) => callback());
  }

  function subscribe(callback) {
    callbacks.push(callback);
  }

  function getState() {
    return state;
    return { ...state }; // TODO 차이?
  }

  // 클로저로 private state, private callbacks 구현해 정보 은닉
  return {
    dispatch,
    subscribe,
    getState,
  };
};

/**
 * @function savedState
 * @description localStorage에 접근해 store의 state를 저장하는 함수
 */
const saveState = () => {
  const state = store.getState();
  localStorage.setItem("state", JSON.stringify(state));
};

/**
 * @function getInitState
 * @description localStorage에서 초기 상태값을 가져오는 함수
 */
const getInitState = () => {
  const savedState = JSON.parse(localStorage.getItem("state"));

  if (savedState !== null) {
    return savedState;
  }

  const stateTemplate = {
    menuList: {
      [ESPRESSO]: [],
      [FRAPPUCINO]: [],
      [BLENDED]: [],
      [TEAVANA]: [],
      [DESSERT]: [],
    },
  };

  return stateTemplate;
};

/**
 * @function reducer
 * @param {Object} state
 * @param {Object} action
 * @description state를 복제한 객체에 action.type에 따라 상태 변경을 반영한 결과를 반환하는 함수
 * @toddo const로 선언하면 블록 내에서 같은 변수명 재사용 불가 -> 클린 코드?
 * @todo reducer는 디폴트값으로 initialState받을 때, localStorage를 연결하는게 맞을까?
 * @todo 최대한 Flat하게 state를 변경하거나 immutable.js 사용하거나 deepcopy 수행하는 코드로 변경하기
 */
const reducer = (state = getInitState(), action) => {
  const { type, payload } = action;
  const { tab } = componentState;
  switch (type) {
    case INIT_MENU:
      return { ...state };
    case ADD_MENU:
      const { name } = payload;
      const newItem = { name, soldOut: false };
      return {
        ...state,
        menuList: {
          ...state.menuList,
          [tab]: [...state.menuList[tab], newItem],
        },
      };
    case UPDATE_MENU:
      const { updateIdx, newName } = payload;
      const updatedMenu = state.menuList[tab].map((item, idx) => {
        if (idx === updateIdx) {
          const updatedItem = { ...item, name: newName };
          return updatedItem;
        }
        return item;
      });
      return { ...state, menuList: { ...state.menuList, [tab]: updatedMenu } };
    case REMOVE_MENU:
      const { removeIdx } = payload;
      const removedMenu = state.menuList[tab].filter(
        (_, idx) => idx !== removeIdx
      );
      return { ...state, menuList: { ...state.menuList, [tab]: removedMenu } };
    case TOGGLE_MENU:
      const { toggleIdx } = payload;
      const toggledMenu = state.menuList[tab].map((item, idx) => {
        if (idx === toggleIdx) {
          const toggledItem = { ...item, soldOut: !item.soldOut };
          return toggledItem;
        }
        return item;
      });
      return { ...state, menuList: { ...state.menuList, [tab]: toggledMenu } };
    default:
      return { ...state };
  }
};

/**
 * 하단의 changeTab, addMenu, updateMenu, removeMenu, toggleMenu는 이벤트 핸들러로 등록되는 함수
 * DOM 요소에는 사용자 입력값을 가져올 때만 접근하는 것 외에 직접 접근 하지 않음
 * 하단 함수들은 setState나 dispatch를 통해 상태 변경 요청만 보냄
 * 즉, 요청을 보낸 뒤, 따로 DOM 조작에 신경 쓸 필요 없음
 */

/**
 * @function changeTab
 * @param {Event} e
 * @description	사용자가 네비게이션 바에서 탭 전환시 탭 상태 변경하는 함수
 */
const changeTab = (e) => {
  const { tab: currTab } = componentState;
  const newTab = e.target.dataset.categoryName;

  if (currTab === newTab) return;
  setState({ tab: newTab });
};

/**
 * @function addMenu
 * @description 사용자가 input에 메뉴명을 기입한 뒤, enter를 누르거나 제출 버튼을 누른 경우 메뉴를 추가함
 */
const addMenu = () => {
  const input = $("input");

  const name = input.value;

  if (!name) return;

  store.dispatch(createAddAction({ name }));

  input.value = "";
};

/**
 * @function updateMenu
 * @param {Event} e
 * @description 사용자가 수정 버튼을 누른 뒤, confirm에 수정 메뉴 이름을 기입하면, 헤당 메뉴의 이름을 수정함
 */
const updateMenu = (e) => {
  const prevName = e.target.closest("li").querySelector("span").innerText;
  const updateIdx = Number(e.target.dataset.index);

  const newName = prompt("메뉴명을 수정하세요", prevName);

  if (newName === null) return;

  store.dispatch(createUpdateAction({ updateIdx, newName }));
};

/**
 * @function removeMenu
 * @param {Event} e
 * @description 사용자가 삭제 버튼을 누르면, 해당 메뉴를 삭제함
 */
const removeMenu = (e) => {
  const ret = confirm("정말 삭제하시겠습니까?");
  if (!ret) return;

  const removeIdx = Number(e.target.dataset.index);

  store.dispatch(createRemoveAction({ removeIdx }));
};

/**
 * @function toggleMenu
 * @param {Event} e
 * @description 사용자가 품절 버튼 누르면 해당 메뉴 품절 여부를 토글함
 */
const toggleMenu = (e) => {
  const toggleIdx = Number(e.target.dataset.index);

  store.dispatch(createToggleAction({ toggleIdx }));
};

/**
 * @function setEventHandler
 * @description DOM 요소에 직접 접근해 이벤트 핸들러 등록
 */
const setEventHandler = () => {
  const app = $("#app");
  const form = $("form");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
  });

  // 메뉴탭 전환
  app.addEventListener("click", (e) => {
    if (e.target.classList.contains("cafe-category-name")) {
      changeTab(e);
      return;
    }
  });

  // 메뉴 추가
  app.addEventListener("submit", () => {
    addMenu();
  });

  // 메뉴 토글/수정/삭제
  app.addEventListener("click", (e) => {
    if (e.target.classList.contains("toggle-btn")) {
      toggleMenu(e);
      return;
    }
    if (e.target.classList.contains("edit-btn")) {
      updateMenu(e);
      return;
    }
    if (e.target.classList.contains("remove-btn")) {
      removeMenu(e);
      return;
    }
  });
};

/**
 * 하단의 updateTotal, updateTitle은 DOM 요소에 직접 접근하여 DOM 요소를 조작하여 직접 렌더링 수행
 * TODO updateTotal, updateTitle에서 DOM 직접조작 하지 않도록 렌더링 로직 분리하기(추상화 할 때 적용하기)
 */

/**
 * @function updateTotal
 * @description 상단바의 총 메뉴 개수를 업데이트
 */
const updateTotal = () => {
  const { menuList } = store.getState();
  const { tab } = componentState;
  const menu = menuList[tab];
  const cnt = $(".menu-count");
  cnt.innerText = `총 ${menu.length}개`;
};

/**
 * @function updateTitle
 * @description 상단바의 메뉴 카테고리명 업데이트
 */
const updateTitle = () => {
  const { tab } = componentState;
  const title = $("h2");

  const categories = document.querySelectorAll("nav > button");
  const currCategory = Array.from(categories).find(
    (category) => category.dataset.categoryName === tab
  ).innerText;

  title.innerText = `${currCategory} 메뉴 관리`;
};

/**
 * @function template
 * @param {Object} menu
 * @description 렌더링 시 상태에서 메뉴 리스트를 바탕으로 HTML 템플릿을 생성해 리턴하는 함수
 *
 */
const template = (menu) => {
  return menu
    .map(
      ({ name, soldOut }, idx) =>
        `
			<li class="menu-list-item d-flex items-center py-2">
				<span class="w-100 pl-2 menu-name ${soldOut ? "sold-out" : ""}">${name}</span>
				<button
					type="button"
					class="bg-gray-50 text-gray-500 text-sm mr-1 menu-sold-out-button toggle-btn"
					data-index=${idx}
				>
					품절
				</button>
				<button
					type="button"
					class="bg-gray-50 text-gray-500 text-sm mr-1 menu-edit-button edit-btn"
					data-index=${idx}
				>
					수정
				</button>
				<button
					type="button"
					class="bg-gray-50 text-gray-500 text-sm menu-remove-button remove-btn"
					data-index=${idx}
				>
					삭제
				</button>
			</li>
			`
    )
    .join("");
};

/**
 * @function render
 * @description DOM 요소에 직접 접근해 조작하는 과정을 추상화 함수
 * 							페이지 최초 렌더링 시나 컴포넌트 상태 변화시 호출됨
 * @todo globalState, ComponentState 변경이 요소 전체가 리렌더링으로 이어지는 맥락 파악하기
 */
const render = () => {
  const { menuList } = store.getState();
  const { tab } = componentState;
  const currTabMenu = menuList[tab];

  const list = $("ul");

  list.innerHTML = template(currTabMenu);

  updateTotal();
  updateTitle();
};

/**
 * @function initialRender
 * @description 최초 렌더링 시, setEventHandler 호출해 이벤트 핸들러 등록
 */
const initialRender = () => {
  setEventHandler();
  render();
};

/**
 * @function setState
 * @param {Object} newState
 * @description 컴포넌트 내부 상태 업데이트 하는 과정 추상화 함수
 * 							기존 상태를 복제한 신규 상태 객체를 만든 뒤, 업데이트를 진행하므로 상태의 불변성 유지됨.
 * 							상태 변화시 변경 전 상태와 변경 후 상태를 console에 출력
 */
const setState = (newState) => {
  const prevState = componentState;
  componentState = { ...componentState, ...newState };
  console.log(
    `[setState]: \n(prevState) ${JSON.stringify(
      prevState
    )} \n(currState) ${JSON.stringify(componentState)}`
  );
  render();
};

/**
 * 메인 코드 실행
 */

const store = createStore(reducer);

store.subscribe(function () {
  console.log("[Global State Changed]", store.getState());
});
store.subscribe(saveState);
store.subscribe(render);

initialRender();
