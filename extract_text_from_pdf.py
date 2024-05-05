# 1. RUN VIRTUAL ENVIROMENT python3 -m venv .venv && source .venv/bin/activate
# 2. RUN python3 extract_text_from_pdf.py

import pdfplumber


def extract_text_from_pdf(pdf_path):
    text = ''
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            current_text = page.extract_text()
            if current_text:
                text += ' ' + current_text
    return text


# Extract text from a specific PDF
pdf_text = extract_text_from_pdf('docs/dispenseLibroZigliotto.pdf')

# Save the extracted text to a text file
with open('extracted_text.txt', 'w', encoding='utf-8') as file:
    file.write(pdf_text)

# Optionally, inform the user that the text has been saved
print("Text extracted and saved to 'extracted_text.txt'.")
