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
 * state: 컴포넌트 내부에서 관리할 상태값
 **/
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
 * render: 맨 처음이나 컴포넌트 상태 변화시 DOM 요소 조정 과정을 추상화한 함수
 **/
const render = () => {
  const { menu } = state

  const form = $("form")
  const list = $("ul")

  list.innerHTML = `
		<ul id="espresso-menu-list" class="mt-3 pl-0">
			${menu.map((name, idx) => createItem(name, idx)).join("")}
		</ul>
	`
  // 메뉴 추가
  form.addEventListener("submit", addEventHandler)

  // 메뉴 수정/삭제
  list.addEventListener("click", updateRemoveEventHandler)

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

render()

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

/*
 * 동일 이벤트에 대해 동일한 이벤트를 여러 번 등록하지 않도록 하기 위해, 별도의 함수로 분리.
 * addEventListener는 이벤트 핸들러를 큐에 넣기 전, 참조 메모리 주소에 의해 동일성 여부 검사함.
 **/

function addEventHandler(e) {
  e.preventDefault()
  addMenu()
}

function updateRemoveEventHandler(e) {
  if (e.target.classList.contains("data-edit")) {
    updateMenu(e)
  }
  if (e.target.classList.contains("data-remove")) {
    removeMenu(e)
  }
}
