
from bs4 import BeautifulSoup


 

if __name__ == "__main__":

    url = "https://knowyourmeme.com/memes/success-kid-i-hate-sandcastles"

    sections = scrape_text_kym(url)

    for title, text in sections.items():

        print(f"=== {title} ===")

        print(text)    # real line breaks

        print()        # extra blank line

 

 