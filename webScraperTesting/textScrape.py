
from bs4 import BeautifulSoup import reques... by Le, Tyler
8:36 PM
Le, Tyler

from bs4 import BeautifulSoup

import requests

from urllib.parse import quote

 

import requests

from bs4 import BeautifulSoup

 

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

                        content.append(text)

 

            sections[title] = "\n".join(content)

 

    return sections

 

 

if __name__ == "__main__":

    url = "https://knowyourmeme.com/memes/success-kid-i-hate-sandcastles"

    sections = scrape_text_kym(url)

    for title, text in sections.items():

        print(f"=== {title} ===")

        print(text)    # real line breaks

        print()        # extra blank line

 

 