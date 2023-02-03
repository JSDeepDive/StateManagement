// Step1: 돔 조작과 이벤트 핸들링으로 메뉴 관리하기

const $ = (id) => document.getElementById(id)
const form = $("espresso-menu-form")
const input = $("espresso-menu-name")
const list = $("espresso-menu-list")
const cnt = $("menu-count")

function updateTotal() {
  const num = list.querySelectorAll("li").length
  cnt.innerText = `총 ${num}개`
}

const createHTML = (name) => `
				<span class="w-100 pl-2 menu-name">${name}</span>
				<button
					type="button"
					class="bg-gray-50 text-gray-500 text-sm mr-1 menu-edit-button data-edit"
				>
					수정
				</button>
				<button
					type="button"
					class="bg-gray-50 text-gray-500 text-sm menu-remove-button data-remove"
				>
					삭제
				</button>
			`

function addMenu() {
  const name = input.value
  if (!name) return

  const item = document.createElement("li")
  item.className = "menu-list-item d-flex items-center py-2"
  item.innerHTML = createHTML(name)

  list.appendChild(item)

  updateTotal()

  input.value = ""
}

function updateMenu(e) {
  const span = e.target.closest("li").querySelector("span")
  const ret = prompt("메뉴명을 수정하세요", span.innerHTML)
  if (ret === null) return
  span.innerHTML = ret
}

function removeMenu(e) {
  const li = e.target.closest("li")
  const ret = confirm("정말 삭제하시겠습니까?")
  if (!ret) return
  li.remove()
  updateTotal()
}

function App() {
  //  form 요소의 상위 submit 이벤트로 하위 요소의 click, keyup 이벤트 처리
  form.addEventListener("submit", (e) => {
    e.preventDefault()
    addMenu()
  })

  // ul 요소에 수정/삭제 button 이벤트 위임
  list.addEventListener("click", (e) => {
    if (e.target.classList.contains("data-edit")) {
      updateMenu(e)
    }
    if (e.target.classList.contains("data-remove")) {
      removeMenu(e)
    }
  })
}

App()
