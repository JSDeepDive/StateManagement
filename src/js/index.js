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

const $ = (selector) => document.querySelector(selector)

/*
 * state: 전역 상태
 */
let state = {
  menu: [
    "long black",
    "americano",
    "espresso con panna",
    "lattte",
    "cafe mocha",
    "cappucino",
  ],
}

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
const render = () => {
  const { menu } = state

  const list = $("ul")

  list.innerHTML = template(menu)

  updateTotal()
}

/*
 * setState: 컴포넌트 내부 상태 업데이트 하는 과정을 추상화한 함수
 **/
const setState = (newState) => {
  const prevState = state
  state = { ...state, ...newState }
  console.log(
    `[setState]: \n(prevState) ${JSON.stringify(
      prevState
    )} \n(currState) ${JSON.stringify(state)}`
  )
  render()
}

initialRender()

/*
 * setEventHandler: DOM 요소에 이벤트 핸들러 등록
 **/
function setEventHandler() {
  const form = $("form")
  const list = $("ul")

  // 메뉴 추가
  form.addEventListener("submit", (e) => {
    e.preventDefault()
    addMenu()
  })

  // 메뉴 수정/삭제
  list.addEventListener("click", (e) => {
    if (e.target.classList.contains("data-edit")) {
      updateMenu(e)
    }
    if (e.target.classList.contains("data-remove")) {
      removeMenu(e)
    }
  })
}

/*
 * render 내부에서 menu 상태를 받아 HTML 태그 구조를 반환하는 함수
 **/
function template(menu) {
  return menu
    .map(
      (name, idx) =>
        `
			<li class="menu-list-item d-flex items-center py-2">
				<span class="w-100 pl-2 menu-name">${name}</span>
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
  const { menu } = state
  const input = $("input")

  const name = input.value

  if (!name) return

  setState({ menu: [...menu, name] }) // setState 통해 메뉴 추가시 자동으로 DOM 요소 처리함

  input.value = ""
}

function updateMenu(e) {
  const { menu } = state

  const prevName = e.target.closest("li").querySelector("span").innerText
  const index = Number(e.target.dataset.index)

  const newName = prompt("메뉴명을 수정하세요", prevName)

  if (newName === null) return

  // setState 통해 메뉴 업데이트 시 자동으로 DOM 요소 처리함
  setState({
    menu: menu.map((name, idx) => {
      if (index === idx) return newName
      return name
    }),
  })
}

function removeMenu(e) {
  const { menu } = state

  const ret = confirm("정말 삭제하시겠습니까?")
  if (!ret) return

  const index = Number(e.target.dataset.index)

  // setState 통해 메뉴 삭제 시 자동으로 DOM 요소 처리함
  setState({
    menu: menu.filter((_, idx) => index !== idx),
  })
}

function updateTotal() {
  const { menu } = state
  const cnt = $(".menu-count")
  cnt.innerText = `총 ${menu.length}개`
}