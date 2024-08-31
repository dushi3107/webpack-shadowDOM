itembank-index-frontend

總庫搜尋系統與結果頁面的HTML表單元件

## Custom HTML shadow DOM element

* Global variables, exported methods and definitions that you can use them directly
  1. SEARCH_STATE：頁面狀態，當事件發生時會以event.state的參數傳入callback，可以指定做相對應的任務
      ```javascript
      // SEARCH_STATE：頁面狀態，當事件發生時會以event.state的參數傳入callback，可以指定做相對應的任務
      export const SEARCH_STATE = {
        INIT: 0,          // 預設狀態
        SUBMIT: 1,        // 表單提交
        BACK_CLICK: 2,    // 回搜尋頁
        COMPARE_CLICK: 3  // 試題比對
      }

      window.itembanksearch.SEARCH_STATE = SEARCH_STATE;
      ```
  2. CUSTOM_ELEMENT_NAME_INDEX, CUSTOM_ELEMENT_NAME_RESULT：此客製化元件名稱
      ```javascript
      export const CUSTOM_ELEMENT_NAME_INDEX = "itembank-index";
      export const CUSTOM_ELEMENT_NAME_RESULT = "itembank-result";

      window.itembanksearch.CUSTOM_ELEMENT_NAME_INDEX = CUSTOM_ELEMENT_NAME_INDEX;
      window.itembanksearch.CUSTOM_ELEMENT_NAME_RESULT = CUSTOM_ELEMENT_NAME_RESULT;
      ```
  3. createIndexForm, removeIndexForm：建立/移除條件搜尋表單，建立方法需傳入callback
      ```javascript
      const createIndexForm = (param = { searchId: null, onStateChangeCallback: null }) => {
        window.itembanksearch.searchId = param.searchId;
        window.itembanksearch.onStateChange = param.onStateChangeCallback;
        const element = document.createElement(CUSTOM_ELEMENT_NAME_INDEX);
        return element;
      }

      const removeIndexForm = () => {
        let instance = document.querySelector(CUSTOM_ELEMENT_NAME_INDEX);
        if (instance) {
          instance.remove();
        }
      }

      window.itembanksearch.createIndexForm = createIndexForm;
      window.itembanksearch.removeIndexForm = removeIndexForm;
      ```
  4. createResultForm, removeResultForm：建立/移除結果顯示表單，建立方法需傳入callback
      ```javascript
      const createResultForm = (param = { searchId: null, onStateChangeCallback: null }) => {
        window.itembanksearch.searchId = param.searchId;
        window.itembanksearch.onStateChange = param.onStateChangeCallback;
          const element = document.createElement(CUSTOM_ELEMENT_NAME_RESULT);
          return element;
      }

      const removeResultForm = () => {
          let instance = document.querySelector(CUSTOM_ELEMENT_NAME_RESULT);
          if (instance) {
              instance.remove();
          }
      }

      window.itembanksearch.createResultForm = createResultForm;
      window.itembanksearch.removeResultForm = removeResultForm;
      ```
  5. callback範例，請參考以下實際應用

* Usage for creating custom element in html

  real usage refrence [./index.html](./src/pages/index.html#L16)
    ```html
    <head>
      <script src="./itembank-search.bundle.js"></script>
    </head>
    <body>
      <div class="container">
        <div class="dynamic-content" id="dynamic-content">
        </div>
      </div>
      <script>
        let formBody = document.querySelector(".dynamic-content");
        /**
         │
         ├── 總庫搜尋 /?searchId=xxx
         │   ├── 搜尋頁 /index?searchId=xxx
         │   ├── 結果頁 /result?searchId=xxx
         │   └── ...
         */
        const ROUTE = {
          INDEX: 'index',
          RESULT: 'result',
        };
        /**
         * callback function，用來指定任務給相對應的狀態變化，如：
         * 1. 點擊回到上一頁後導回總庫搜尋
         * 2. 提交表單後導向結果頁
         * 3. 點擊試題比對導向比較頁
         */
        const onStateChange = function (event) {
          switch (event.state) {
            case itembanksearch.SEARCH_STATE.SUBMIT:
              var href = window.location.origin + '/' + ROUTE.RESULT + '?searchId=' + event.searchId;
              history.pushState(null, '', href);

              itembanksearch.removeIndexForm();
              formBody.appendChild(itembanksearch.createResultForm({ searchId: event.searchId, onStateChangeCallback: onStateChange }));
              break;
            case itembanksearch.SEARCH_STATE.BACK_CLICK:
              var href = window.location.origin + '/' + ROUTE.INDEX + '?searchId=' + event.searchId;
              history.pushState(null, '', href);

              itembanksearch.removeResultForm();
              formBody.appendChild(itembanksearch.createIndexForm({ searchId: event.searchId, onStateChangeCallback: onStateChange }));
              break;
            case itembanksearch.SEARCH_STATE.COMPARE_CLICK:
              console.log(event.ids);
              // let ids = event.ids;
              // redirect to compare page
              break;
          }
        }
        /**
         * 模擬實際路由，頁面切換
         */
        const getLastSubRoute = (url) => {
          const urlObj = new URL(url);
          const pathname = urlObj.pathname;
          const segments = pathname.split('/').filter(Boolean);

          return segments.pop();
        }
        const param = { searchId: new URLSearchParams(window.location.search).get("searchId"), onStateChangeCallback: onStateChange };
        const handleUrlChange = (url) => {
          let subRoute = getLastSubRoute(window.location.href);
          // create object
          if (subRoute == ROUTE.RESULT) {
            itembanksearch.removeIndexForm();
            formBody.appendChild(itembanksearch.createResultForm(param));
          } else {
            itembanksearch.removeResultForm();
            formBody.appendChild(itembanksearch.createIndexForm(param));
          }
        }
        handleUrlChange(window.location.href); // init
        window.addEventListener('popstate', (event) => {
          handleUrlChange(window.location.href);
        });
      </script>
    ```
* Font-Awesome (script and styles) must be loaded both the **main DOM** and **showdow DOM**.


## Webpack project bulid and run

* Dependency
  ```
  npm i --save
  ```

* Build
  ```
  npx webpack --node-env development
  npx webpack --node-env production
  ```

* Run
  ```
  npx webpack serve --node-env development
  npx webpack serve --node-env production
  ```