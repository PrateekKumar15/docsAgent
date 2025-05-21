# main.py
import os
import requests
from bs4 import BeautifulSoup
import google.generativeai as genai
from dotenv import load_dotenv # Import load_dotenv

load_dotenv() # Load environment variables from .env file

# Configure the Gemini API key
# Make sure to set the GEMINI_API_KEY environment variable
gemini_api_key = os.environ.get("GEMINI_API_KEY")
if not gemini_api_key:
    print("Error: The GEMINI_API_KEY environment variable is not set.")
    print("Please set this environment variable with your Gemini API key and try again.")
    exit()

genai.configure(api_key=gemini_api_key)

# Initialize the generative model
model = genai.GenerativeModel('gemini-2.0-flash')

def scrape_website(url):
    """Scrapes the text content from a given URL."""
    print(f"Scraping {url}...")
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()  # Raise an exception for bad status codes
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Remove script and style elements
        for script_or_style in soup(["script", "style"]):
            script_or_style.decompose()
        
        # Get text
        text = soup.get_text()
        
        # Break into lines and remove leading/trailing space on each
        lines = (line.strip() for line in text.splitlines())
        # Break multi-headlines into a line each
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        # Drop blank lines
        text = '\n'.join(chunk for chunk in chunks if chunk)
        print("Scraping completed.")
        return text
    except requests.exceptions.RequestException as e:
        print(f"Error scraping website: {e}")
        return None

def ask_ai(document_text, question):
    """Asks the Gemini AI a question based on the provided document text."""
    if not document_text:
        return "I don't have any document content to answer from."

    print("Asking AI...")
    try:
        prompt = f"Based on the following document, please answer the question.\n\nDocument:\n{document_text[:10000]} \n\nQuestion: {question}"
        response = model.generate_content(prompt)
        print("AI response received.")
        return response.text
    except Exception as e:
        print(f"Error interacting with AI: {e}")
        return "Sorry, I encountered an error trying to answer your question."

if __name__ == "__main__":
    print("Starting AI Agent Prototype...")
    doc_url = input("Enter the URL of the documentation to scrape: ")
    scraped_content = scrape_website(doc_url)

    if scraped_content:
        print(f"\nSuccessfully scraped {len(scraped_content)} characters from the URL.")
        while True:
            user_question = input("\nAsk a question about the document (or type 'exit' to quit): ")
            if user_question.lower() == 'exit':
                break
            if not user_question.strip():
                print("Please enter a question.")
                continue
            answer = ask_ai(scraped_content, user_question)
            print(f"\nAI Agent: {answer}")
    else:
        print("Could not scrape any content. Please check the URL and your internet connection.")
    
    print("\nExiting AI Agent Prototype.")
