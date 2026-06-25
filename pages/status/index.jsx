import useSWR from "swr";
import DOMPurify from "dompurify";

async function fecthAPI(key) {
  const response = await fetch(key),
    responseBody = await response.json();

  return responseBody;
}

function capitalizeFirstLetters(str) {
  if (!str) return str;

  let strArr = str.split(" ");
  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  for (let i in strArr) strArr[i] = capitalize(strArr[i]);

  return strArr.join(" ");
}

function formatKeyText(text = "") {
  let formatedText = text.replace(/_/g, " ");
  return capitalizeFirstLetters(formatedText);
}

function DynamicStatus({ isLoading, data }) {
  const wraperHTML = (value = "", tag = "span") => {
    return `<${tag}>${value}</${tag}>`;
  };

  const depsHTMLBuilder = (dep = {}, isObj = false) => {
    const entries = Object.entries(dep);
    let html = "";

    for (let [key, value] of entries) {
      if (typeof value === "object" && !Array.isArray(value)) {
        html += `${isObj ? "" : "<br>"}${formatKeyText(key)}: ${wraperHTML(depsHTMLBuilder(value, true), "ul")}`;
      } else if (Array.isArray(value)) {
        html += wraperHTML(
          `${formatKeyText(key)}: ${value.join(", ")}`,
          isObj ? "li" : "span",
        );
      } else {
        html += wraperHTML(
          `${formatKeyText(key)}: ${value}`,
          isObj ? "li" : "span",
        );
      }
    }

    return html;
  };

  let deps = <p>Loading...</p>;

  if (!isLoading && data) {
    deps = DOMPurify.sanitize(depsHTMLBuilder(data));
  }

  return <div dangerouslySetInnerHTML={{ __html: deps }} />;
}

export default function StatusPage() {
  const { isLoading, data } = useSWR("/api/v1/status", fecthAPI, {
    refreshInterval: 2000,
  });

  return (
    <>
      <h1>Status</h1>
      <DynamicStatus isLoading={isLoading} data={data} />
    </>
  );
}
