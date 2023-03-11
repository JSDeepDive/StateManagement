// Step1: 돔 조작과 이벤트 핸들링으로 메뉴 관리하기

const $$ = (element) => (selector) => {
  const arr = element.querySelectorAll(selector);
  if (arr.length === 1) {
    return arr[0];
  }
  return arr;
};

const $ = $$(document);

const form = $("#espresso-menu-form");
const input = $("#espresso-menu-name");
const button = $("#espresso-menu-submit-button");
const list = $("#espresso-menu-list");
const cnt = $(".menu-count");
let nums = 0;

function createElem(item, name) {
  const span = document.createElement("span");
  span.className = "w-100 pl-2 menu-name";
  span.innerHTML = name;

  const edit = document.createElement("button");
  edit.type = "button";
  edit.className = "bg-gray-50 text-gray-500 text-sm mr-1 menu-edit-button";
  edit.innerHTML = "수정";
  edit.addEventListener("click", updateMenuBind(edit, span));

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "bg-gray-50 text-gray-500 text-sm menu-remove-button";
  remove.innerHTML = "삭제";
  remove.addEventListener("click", removeMenuBind(remove, item));

  item.appendChild(span);
  item.appendChild(edit);
  item.appendChild(remove);
}

function updateTotal() {
  cnt.innerHTML = `총 ${nums}개`;
}

function addMenu() {
  const name = input.value;
  if (!name) return;

  const item = document.createElement("li");
  item.className = "menu-list-item d-flex items-center py-2";

  createElem(item, name);

  list.appendChild(item);

  nums += 1;
  updateTotal();

  input.value = "";
}

const binder =
  (func) =>
  (thisArg, ...args) =>
    func.bind(thisArg, ...args);
const updateMenuBind = binder(updateMenu);
const removeMenuBind = binder(removeMenu);

function updateMenu(span) {
  const ret = prompt("메뉴명을 수정하세요", span.innerHTML);
  if (ret === null) return;
  span.innerHTML = ret;
}

function removeEventListeners(elements, events, handlers) {
  elements.forEach((elem, idx) =>
    elem.removeEventListener(events[idx], handlers[idx])
  );
}

function removeMenu(item) {
  const ret = confirm("정말 삭제하시겠습니까?");
  if (!ret) return;
  $$(item)("span").innerHTML = "삭제한 메뉴";
  // list.removeChild(item);

  // 이벤트 리스너 해제
  removeEventListeners(
    $$(item)("button"),
    ["click", "click"],
    [updateMenuBind, removeMenuBind]
  );

  item = null;
  nums -= 1;
  updateTotal();
}

function setEventListeners() {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
  });
  button.addEventListener("click", () => {
    addMenu();
  });
  input.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
      addMenu();
    }
  });
}

function App() {
  setEventListeners();
}

App();
