const fs = require("fs");
const fetch = require("node-fetch");
const apiUrl =
  "https://en.wikipedia.org/w/api.php?action=query&list=random&rnlimit=20&rnnamespace=0&format=json";
const wikiUrl = "https://en.wikipedia.org/wiki/";

const getData = async (url, format = "json") => {
  let result = null;
  try {
    console.log(`downloading ${format} from url ${url}...`);
    const response = await fetch(url);
    result = format === "json" ? await response.json() : await response.text();
  } catch (error) {
    console.warn(error);
  }
  console.log("download done!");
  return result;
};

const writeFiles = pages => {
  for (const page of pages) {
    const fileName = page.title.replace(/ /g, "_").replace("/", "%2F");
    fs.writeFileSync(`./db/pages/${fileName}.html`, page.html);
  }
};

const fetchArticles = async url => {
  let pages = [];
  console.log("fetching random wikipedia pages...");

  for (let i = 0; i < 10; i++) {
    const result = await getData(apiUrl);
    pages = [...pages, ...result.query.random];
  }
  return pages;
};

const getHtml = async pages => {
  for (const page of pages) {
    const articleTitle = encodeURI(page.title.replace(/ /g, "_"));
    const html = await getData(wikiUrl + articleTitle, "text");
    page.html = html;
  }
};

const createFolders = () => {
  try {
    fs.mkdirSync("db");
    fs.mkdirSync("db/pages");
  } catch (error) {
    console.log(error);
  }
};

const crawl = async () => {
  createFolders();
  const randomPages = await fetchArticles(apiUrl);

  console.log("fetching 200 pages...");

  await getHtml(randomPages);

  console.log(`downloaded ${randomPages.length} pages`);

  console.log("saving html to files...");

  writeFiles(randomPages);

  console.log("done!");
};

crawl();
