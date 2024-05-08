# 1. RUN VIRTUAL ENVIROMENT python3 -m venv .venv && source .venv/bin/activate
# 2. RUN python3 extract_text_from_pdf.py

import fitz


def extract_text_with_images(pdf_path):
    try:
        doc = fitz.open(pdf_path)
    except Exception as e:
        return f"Error opening file: {e}"

    text_parts = []  # Use a list to gather text

    for page_num in range(len(doc)):
        try:
            page = doc.load_page(page_num)
        except Exception as e:
            text_parts.append(f"Error loading page {page_num}: {e}")
            continue  # Skip to the next page if this one fails

        blocks = page.get_text("dict")["blocks"]

        for block in blocks:
            if block["type"] == 0:  # text block
                block_text = ""
                for line in block["lines"]:
                    line_text = " ".join(span["text"]
                                         for span in line["spans"])
                    block_text += line_text + " "
                text_parts.append(block_text.strip())  # Trim and add to list
            elif block["type"] == 1:  # image block
                text_parts.append("\n[IMAGE]\n")
            # vector block (usually contains diagrams or formulas)
            elif block["type"] == 2:
                text_parts.append("\n[FORMULA]\n")

    # Join all parts and replace common artifacts
    full_text = "".join(text_parts)
    clean_text = full_text.replace("\u0000", "").replace(
        "�", "")  # Remove NULL bytes and replacement characters
    return clean_text


# Example usage:
# Extract text from a specific PDF
pdf_text = extract_text_with_images("docs/dispenseLibroZigliotto.pdf")

# Save the extracted text to a text file
with open('extracted_text.txt', 'w', encoding='utf-8') as file:
    file.write(pdf_text)

# Inform the user that the text has been saved
print("Text extracted and saved to 'extracted_text.txt'.")
