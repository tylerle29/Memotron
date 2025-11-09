from bs4 import BeautifulSoup
import requests
from urllib.parse import quote
import re

def kym_search_image(query):
    url = f"https://knowyourmeme.com/search?q={quote(query)}"
    r = requests.get(url, headers={"User-Agent": "Mozilla/5.0"})
    soup = BeautifulSoup(r.text, "html.parser")

    # 1. find the first meme-page link that contains an image with data-image
    candidates = soup.select('a[href^="/memes/"]')
    page = None

    for a in candidates:
        img = a.select_one("img[data-image]")
        if img:
            page = a
            img_tag = img
            break

    if page is None:
        print("No match")
        return None

    # page URL
    page_url = "https://knowyourmeme.com" + page["href"]

    # high-quality image from data-image
    img_url = img_tag["data-image"]

    print("Page:", page_url)
    print("Image:", img_url)
    return (page_url, img_url)

def scrape_text_kym(url):

    # 1. Request webpage

    headers = {"User-Agent": "Mozilla/5.0"}

    response = requests.get(url, headers=headers)

    response.raise_for_status()

 

    # 2. Parse HTML

    soup = BeautifulSoup(response.text, "html.parser")

    # Sets up the sections we need to parse.

    sections = {}

    relevant_titles = [

    "About", "Origin", "Spread", "History", "Background", "Meaning", "Usage", "Development", "Overview"

    ]

 

    # Parses them.

    for h2 in soup.find_all("h2"):

        title = h2.get_text(strip=True)

        if title in relevant_titles:

            content = []

 

            # Walk through siblings until the next h2

            for sib in h2.next_siblings:

                if getattr(sib, "name", None) == "h2":

                    break

                if sib.name in ["p"]:

                    text = sib.get_text(" ", strip=True)

                    if text:
                        text = re.sub(r"\[.*?\]", "", text)
                        content.append(text.strip())

 

            sections[title] = "\n".join(content)

 

    return sections

 


if __name__ == "__main__":
    page_url, img_url = kym_search_image("one does not simply")

    sections = scrape_text_kym(page_url)

    for title, text in sections.items():

        print(f"=== {title} ===")

        print(text)    # real line breaks

        print()        # extra blank line

