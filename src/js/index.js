// Step1: 돔 조작과 이벤트 핸들링으로 메뉴 관리하기(v3)

const createItem = (name, key) => `
			<li class="menu-list-item d-flex items-center py-2">
				<span class="w-100 pl-2 menu-name">${name}</span>
				<button
					type="button"
					class="bg-gray-50 text-gray-500 text-sm mr-1 menu-edit-button data-edit"
					data-index=${key}
				>
					수정
				</button>
				<button
					type="button"
					class="bg-gray-50 text-gray-500 text-sm menu-remove-button data-remove"
					data-index=${key}
				>
					삭제
				</button>
			</li>
			`

const $ = (selector) => document.querySelector(selector)

/*
 * Component: state, setState, render 및 기타 메서드로 구성된 웹 컴포넌트
 **/
class Component {
  $target
  $state

  constructor($target, $state) {
    this.$target = $target
    this.setup()
    this.render()
  }

  // setup: 초기 state 설정하는 함수
  setup() {}

  // template: target DOM 요소 내부의 자식 요소들을 문자열 형태로 반환하는 함수
  template() {
    return ""
  }

  // setEvent: target DOM 요소에 이벤트 핸들러를 등록하는 함수
  setEvent() {}

  // render: 맨 처음이나 컴포넌트 상태 변화시 DOM 요소 조정 과정을 추상화한 함수
  render() {
    this.$target.innerHTML = this.template()
    this.setEvent()
  }

  // setState: 컴포넌트 내부 상태 업데이트 하는 과정을 추상화한 함수
  setState(newState) {
    this.$state = { ...this.$state, ...newState }
    console.log(
      `[setState]: \n(prevState) ${JSON.stringify(
        prevState
      )} \n(currState) ${JSON.stringify(state)}`
    )
    this.render()
  }
}

/*
 * state: 상태
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
 * setEventHandler: DOM 요소에 이벤트 핸들러 등록
 **/
const setEventHandler = () => {
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

  list.innerHTML = `
		<ul id="espresso-menu-list" class="mt-3 pl-0">
			${menu.map((name, idx) => createItem(name, idx)).join("")}
		</ul>
	`

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
 * 하단의 addMenu, updateMenu, removeMenu, updateTotal은 render 함수 내부에서 호출하는 함수
 * DOM 요소에는 값을 가져올 때만 접근하고, 값이 변경될 때 DOM 요소를 직접 접근하지 않고 setState로 처리함
 **/
const addMenu = () => {
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
