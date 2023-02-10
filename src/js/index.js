/*
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
 **/

/*
 * **********************************************************************
 * Step2
 * [ ] localStorage에 데이터를 저장하여 새로고침해도 데이터가 남아있게 한다.
 * [v] 에스프레소, 프라푸치노, 블렌디드, 티바나, 디저트 각각의 종류별로 메뉴판을 관리할 수 있게 만든다.
 * [ ] 페이지에 최초로 접근할 때는 에스프레소 메뉴가 먼저 보이게 한다.
 * [v] 품절 상태인 경우를 보여줄 수 있게, 품절 버튼을 추가하고 sold-out class를 추가하여 상태를 변경한다.
 * (v1) 상태 관리로 메뉴 관리하기
 *
 * **********************************************************************
 **/

const $ = (selector) => document.querySelector(selector)

function createStore(reducer) {
  let state
  let callbacks = []

  dispatch(actionCreator(INIT_MENU, {}))

  function dispatch(action) {
    // state 불변성 유지. state는 오직 store 내에서만 변경 가능.
    state = reducer(state, action)
    // state 변경 시마다 등록된 콜백함수들 동기적으로 호출
    callbacks.forEach((callback) => callback())
  }

  function subscribe(callback) {
    callbacks.push(callback)
  }

  function getState() {
    return state
  }

  // 클로저로 private state, private callbacks 구현해 정보 은닉
  return {
    dispatch,
    subscribe,
    getState,
  }
}

// TODO 상수로 빼는 이유: 휴먼 에러 방지(실제 desert 사례)
const ESPRESSO = "espresso"
const FRAPPUCINO = "frappuccino"
const BLENDED = "blended"
const TEAVANA = "teavana"
const DESSERT = "dessert"

const INIT_MENU = "init-menu"
const ADD_MENU = "add-menu"
const UPDATE_MENU = "update-menu"
const REMOVE_MENU = "remove-menu"
const TOGGLE_MENU = "toggle-menu"

/*
 * initialState: 초기 상태
 */
const initialState = {
  menuList: {
    [ESPRESSO]: [
      { name: "long black", soldOut: false },
      { name: "americano", soldOut: false },
      { name: "espresso con panna", soldOut: false },
      { name: "lattte", soldOut: false },
      { name: "cafe mocha", soldOut: false },
    ],
    [FRAPPUCINO]: [],
    [BLENDED]: [],
    [TEAVANA]: [],
    [DESSERT]: [],
  },
}

let componentState = {
  tab: ESPRESSO,
}

// TODO const로 선언하면 블록 내에서 같은 변수명 재사용 불가 -> 클린 코드?
// reducer는 디폴트값으로 initialState 받음
function reducer(state = initialState, action) {
  // 기존 state값을 복사한 신규 객체를 만들고, 변경 사항을 반영하여 반환함.
  const { type, payload } = action
  const { tab } = componentState
  switch (type) {
    case INIT_MENU:
      return { ...state }
    case ADD_MENU:
      const { name } = payload
      const newItem = { name, soldOut: false }
      // TODO 최대한 Flat하게 state를 변경하거나 immutable.js 사용하거나 deepcopy 수행
      return {
        ...state,
        menuList: {
          ...state.menuList,
          [tab]: [...state.menuList[tab], newItem],
        },
      }
    case UPDATE_MENU:
      const { updateIdx, newName } = payload
      const updatedMenu = state.menuList[tab].map((item, idx) => {
        if (idx === updateIdx) {
          const updatedItem = { ...item, name: newName }
          return updatedItem
        }
        return item
      })
      return { ...state, menuList: { ...state.menuList, [tab]: updatedMenu } }
    case REMOVE_MENU:
      const { removeIdx } = payload
      const removedMenu = state.menuList[tab].filter(
        (_, idx) => idx !== removeIdx
      )
      return { ...state, menuList: { ...state.menuList, [tab]: removedMenu } }
    case TOGGLE_MENU:
      const { toggleIdx } = payload
      const toggledMenu = state.menuList[tab].map((item, idx) => {
        if (idx === toggleIdx) {
          const toggledItem = { ...item, soldOut: !item.soldOut }
          return toggledItem
        }
        return item
      })
      return { ...state, menuList: { ...state.menuList, [tab]: toggledMenu } }
    default:
      return { ...state }
  }
}

// TODO 커링 함수로 변경: 지연 실행
const actionCreator = (type, payload) => {
  return { type, payload }
}

const store = createStore(reducer)

// state 상태 변화할 때마다 로그 찍는 함수 등록
store.subscribe(function () {
  console.log("[Global State Changed]", store.getState())
})

store.subscribe(render)

/*
 * initialRender : 최초 렌더링 시에만 setEventHandler 수행해 이벤트 핸들러 등록
 **/
const initialRender = () => {
  setEventHandler()
  render()
}

/*
 * render: 맨 처음이나 컴포넌트 상태 변화시 DOM 요소 조정 과정을 추상화한 함수
 **/
// TODO globalState, ComponentState 변경이 요소 전체가 리렌더링으로 이어지는 맥락 파악하기
function render() {
  const { menuList } = store.getState()
  const { tab } = componentState
  const currTabMenu = menuList[tab]

  const list = $("ul")

  list.innerHTML = template(currTabMenu)

  updateTotal()
  updateTitle()
}

/*
 * setState: 컴포넌트 내부 상태 업데이트 하는 과정을 추상화한 함수
 **/
const setState = (newState) => {
  const prevState = componentState
  componentState = { ...componentState, ...newState }
  console.log(
    `[setState]: \n(prevState) ${JSON.stringify(
      prevState
    )} \n(currState) ${JSON.stringify(componentState)}`
  )
  render()
}

initialRender()

/*
 * setEventHandler: DOM 요소에 이벤트 핸들러 등록
 **/
// TODO 향후 추상화하려면 모든 이벤트를 최상위객체 .app에 위임
function setEventHandler() {
  const nav = $("nav")
  const form = $("form")
  const list = $("ul")

  // 메뉴탭 전환
  nav.addEventListener("click", changeTab)

  // 메뉴 추가
  form.addEventListener("submit", (e) => {
    e.preventDefault()
    addMenu()
  })

  // 메뉴 수정/삭제
  list.addEventListener("click", (e) => {
    if (e.target.classList.contains("data-edit")) {
      updateMenu(e)
      return
    }
    if (e.target.classList.contains("data-remove")) {
      removeMenu(e)
      return
    }
    if (e.target.classList.contains("data-toggle")) {
      toggleMenu(e)
      return
    }
  })
}

/*
 * render 내부에서 menu 상태를 받아 HTML 태그 구조를 반환하는 함수
 **/
function template(menu) {
  return menu
    .map(
      ({ name, soldOut }, idx) =>
        `
			<li class="menu-list-item d-flex items-center py-2">
				<span class="w-100 pl-2 menu-name ${soldOut ? "sold-out" : ""}">${name}</span>
				<button
					type="button"
					class="bg-gray-50 text-gray-500 text-sm mr-1 menu-sold-out-button data-toggle"
					data-index=${idx}
				>
					품절
				</button>
				<button
					type="button"
					class="bg-gray-50 text-gray-500 text-sm mr-1 menu-edit-button data-edit"
					data-index=${idx}
				>
					수정
				</button>
				<button
					type="button"
					class="bg-gray-50 text-gray-500 text-sm menu-remove-button data-remove"
					data-index=${idx}
				>
					삭제
				</button>
			</li>
			`
    )
    .join("")
}

/*
 * 하단의 addMenu, updateMenu, removeMenu, updateTotal은 render 함수 내부에서 호출하는 함수
 * DOM 요소에는 값을 가져올 때만 접근하고, 값이 변경될 때 DOM 요소를 직접 접근하지 않고 setState로 처리함
 **/
function addMenu() {
  const input = $("input")

  const name = input.value

  if (!name) return

  store.dispatch(actionCreator(ADD_MENU, { name }))
  // setState({ menu: [...menu, name] }) // setState 통해 메뉴 추가시 자동으로 DOM 요소 처리함

  input.value = ""
}

function updateMenu(e) {
  const prevName = e.target.closest("li").querySelector("span").innerText
  const updateIdx = Number(e.target.dataset.index)

  const newName = prompt("메뉴명을 수정하세요", prevName)

  if (newName === null) return

  store.dispatch(actionCreator(UPDATE_MENU, { updateIdx, newName }))
  // setState 통해 메뉴 업데이트 시 자동으로 DOM 요소 처리함
  // setState({
  //   menu: menu.map((name, idx) => {
  //     if (index === idx) return newName
  //     return name
  //   }),
  // })
}

function removeMenu(e) {
  const ret = confirm("정말 삭제하시겠습니까?")
  if (!ret) return

  const removeIdx = Number(e.target.dataset.index)

  store.dispatch(actionCreator(REMOVE_MENU, { removeIdx }))
  // setState 통해 메뉴 삭제 시 자동으로 DOM 요소 처리함
  // setState({
  //   menu: menu.filter((_, idx) => index !== idx),
  // })
}

function toggleMenu(e) {
  const toggleIdx = Number(e.target.dataset.index)

  store.dispatch(actionCreator(TOGGLE_MENU, { toggleIdx }))
}

function updateTotal() {
  const { menuList } = store.getState()
  const { tab } = componentState
  const menu = menuList[tab]
  const cnt = $(".menu-count")
  cnt.innerText = `총 ${menu.length}개`
}

function updateTitle() {
  const { tab } = componentState
  const title = $("h2")

  const categories = document.querySelectorAll("nav > button")
  const currCategory = Array.from(categories).find(
    (category) => category.dataset.categoryName === tab
  ).innerText

  title.innerText = `${currCategory} 메뉴 관리`
}

function changeTab(e) {
  const { tab: currTab } = componentState
  const newTab = e.target.dataset.categoryName

  if (currTab === newTab) return

  setState({ tab: newTab })
}
