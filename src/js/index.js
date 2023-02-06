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
const list = $("#espresso-menu-list")

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

let renderTimes = 0

// render 내에서 동작하는 addMenu 이벤트
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

  setState({
    menu: menu.filter((_, idx) => index !== idx),
  })
}

const render = () => {
  renderTimes += 1

  const { menu } = state

  const form = $("form")
  const list = $("ul")

  list.innerHTML = `
		<ul id="espresso-menu-list" class="mt-3 pl-0">
			${menu.map((name, idx) => createItem(name, idx)).join("")}
		</ul>
	`
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

// const cnt = $(".menu-count")

// function updateTotal() {
//   const num = list.querySelectorAll("li").length
//   cnt.innerText = `총 ${num}개`
// }

// function App() {
//   //  form 요소의 상위 submit 이벤트로 하위 요소의 click, keyup 이벤트 처리
//   form.addEventListener("submit", (e) => {
//     e.preventDefault()
//     addMenu()
//   })

//   // ul 요소에 수정/삭제 button 이벤트 위임
//   list.addEventListener("click", (e) => {
//     if (e.target.classList.contains("data-edit")) {
//       updateMenu(e)
//     }
//     if (e.target.classList.contains("data-remove")) {
//       removeMenu(e)
//     }
//   })
// }

// App()
