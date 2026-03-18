const tilForm = document.querySelector("#til-form");
const tilList = document.querySelector("#til-list");
const tilDateInput = document.querySelector("#til-date");
const tilTitleInput = document.querySelector("#til-title");
const tilContentInput = document.querySelector("#til-content");
const formStatus = document.querySelector("#form-status");
const STORAGE_KEY = "dongkey-til-items";

const initialTilItems = Array.from(tilList.querySelectorAll(".til-item")).map((item) => ({
  date: item.querySelector("time")?.getAttribute("datetime") || "",
  title: item.querySelector("h3")?.textContent?.trim() || "",
  content: item.querySelector("p")?.textContent?.trim() || "",
}));

const loadTilItems = () => {
  try {
    const savedItems = localStorage.getItem(STORAGE_KEY);
    if (!savedItems) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialTilItems));
      return initialTilItems;
    }

    const parsedItems = JSON.parse(savedItems);
    return Array.isArray(parsedItems) ? parsedItems : initialTilItems;
  } catch (error) {
    return initialTilItems;
  }
};

const saveTilItems = (items) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

const createTilItemElement = ({ date, title, content }) => {
  const article = document.createElement("article");
  article.className = "til-item";

  const time = document.createElement("time");
  time.dateTime = date;
  time.textContent = date;

  const heading = document.createElement("h3");
  heading.textContent = title;

  const paragraph = document.createElement("p");
  paragraph.textContent = content;

  article.append(time, heading, paragraph);
  return article;
};

const renderTilItems = (items) => {
  tilList.innerHTML = "";
  items.forEach((item) => {
    tilList.append(createTilItemElement(item));
  });
};

const resetFormWithToday = () => {
  tilForm.reset();
  tilDateInput.value = new Date().toISOString().slice(0, 10);
  tilTitleInput.focus();
};

let tilItems = loadTilItems();
renderTilItems(tilItems);
tilDateInput.value = new Date().toISOString().slice(0, 10);

tilForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const newItem = {
    date: tilDateInput.value,
    title: tilTitleInput.value.trim(),
    content: tilContentInput.value.trim(),
  };

  if (!newItem.date || !newItem.title || !newItem.content) {
    formStatus.textContent = "날짜, 제목, 내용을 모두 입력해주세요.";
    return;
  }

  tilItems = [newItem, ...tilItems];
  saveTilItems(tilItems);
  renderTilItems(tilItems);

  formStatus.textContent = `${newItem.date} 학습 기록이 목록에 추가되었습니다.`;
  resetFormWithToday();
});

tilForm.addEventListener("reset", () => {
  window.setTimeout(() => {
    tilDateInput.value = new Date().toISOString().slice(0, 10);
    formStatus.textContent = "입력값을 비웠습니다. 새로운 학습 기록을 남겨보세요.";
  }, 0);
});
