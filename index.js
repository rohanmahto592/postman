import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import prettyBytes from "pretty-bytes";
import JSONEditor from "jsoneditor";
const form = document.querySelector("[data-form]");
const defaultExpiration=3600
const queryParamsContainer = document.querySelector("[data-query-params]");
const requestHeadersContainer = document.querySelector(
  "[data-request-headers]"
);
const responseHeaders = document.querySelector("[data-response-headers]");
const dataStatus = document.querySelector("[data-status]");
const dataTime = document.querySelector("[data-time]");
const dataSize = document.querySelector("[data-size]");
queryParamsContainer.append(createKeyValuePair());
document
  .querySelector("[data-add-query-param-btn]")
  .addEventListener("click", (e) => {
    queryParamsContainer.append(createKeyValuePair());
  });
requestHeadersContainer.append(createKeyValuePair());
document
  .querySelector("[data-add-request-header-btn]")
  .addEventListener("click", (e) => {
    requestHeadersContainer.append(createKeyValuePair());
  });

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const startTime=new Date().getMilliseconds();
 
  axios({
    url: document.querySelector("[data-url]").value,
    method: document.querySelector("[data-method]").value,
    params: KeyValuesPairsToObject(queryParamsContainer),
    headers: KeyValuesPairsToObject(requestHeadersContainer),
  })
    .catch((e) => e)
    .then((response) => {
      redisClient.setEx(document.querySelector("[data-url]").value,defaultExpiration,JSON.stringify(response))
        const endTime=new Date().getMilliseconds();
      document.querySelector("[data-response-section]").classList.remove("d-none");
      updateResponseDetails(response,startTime,endTime);
      updateResponseEditor(response.data);
      updateResponseHeaders(response.headers);
      console.log(response);
    });
});

function createKeyValuePair() {
  const element = document
    .querySelector("[data-key-value-template]")
    .content.cloneNode(true);
  element.querySelector("[data-remove-btn]").addEventListener("click", (e) => {
    e.target.closest("[data-key-value-pair]").remove();
  });
  return element;
}
function KeyValuesPairsToObject(container) {
  const pairs = container.querySelectorAll("[data-key-value-pair]");
  return [...pairs].reduce((data, pair) => {
    const key = pair.querySelector("[data-key]").value;
    const value = pair.querySelector("[data-value]").value;
    if (key === "") return data;
    return { ...data, [key]: value };
  }, {});
}
function updateResponseDetails(response,startTime,endTime) {
  dataStatus.textContent = " " + response.status + " ";
  if (response.status >= 200 && response.status <= 299) {
    dataStatus.textContent += "Ok";
    dataStatus.style = "color:teal;font-weight:bold";
  } else if (response.status >= 400 && response.status <= 499) {
    dataStatus.textContent += "Error";
    dataStatus.style = "color:red;font-weight:bold";
  }
  dataTime.textContent = endTime-startTime+' '+"ms"
  dataTime.style="font-weight:bold;color:slateblue"
  dataSize.textContent = prettyBytes(
    JSON.stringify(response.data).length +
      JSON.stringify(response.headers).length


  );
  dataSize.style="font-weight:bold;color:slateblue"
}
function updateResponseHeaders(headers) {
  responseHeaders.innerHTML = "";
  Object.entries(headers).forEach(([key, value]) => {
    const keyElement = document.createElement("div");
    keyElement.textContent = key + ":";
    responseHeaders.append(keyElement);
    const valueElement = document.createElement("div");
    valueElement.textContent = value;
    responseHeaders.append(valueElement);
  });
}
function updateResponseEditor(data) {
  const responseBody = document.querySelector("[data-json-response-body]");
  responseBody.innerHTML = "";
  const options = {};
  const editor = new JSONEditor(responseBody, options);
  if (typeof data === "object") {
    editor.set(data);
  } else {
    const obj = data?.reduce((acc, curr) => {
      if (typeof curr === "object" && !Array.isArray(curr)) {
        acc[curr.id] = curr;
      } else {
        acc = curr;
      }
      return acc;
    }, {});

    editor.set(obj);
  }
  // const updatedJson=editor.get();
}
