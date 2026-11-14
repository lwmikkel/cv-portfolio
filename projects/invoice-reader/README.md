# AI invoice reader

Reads PDF invoices with Claude, checks that the VAT and the total add up, and writes a colour-coded Excel report. The invoices are then sorted into folders by result.

Built by Mikkel Leth Wilquin and Nicolai Leth Wilquin as a self-initiated project.

## How it works

1. **Read the PDF.** `pdfplumber` extracts the text from the first page of every PDF in the folder.
2. **Extract the fields.** The text is sent to Claude (`claude-haiku-4-5`) through the Anthropic API. Claude returns supplier, invoice number, date, subtotal, VAT and total, whatever the layout looks like.
3. **Check the numbers in Python.** Claude only reads the invoice. Python does the maths: the VAT must be 25 % of the subtotal, and the total must be subtotal plus VAT, with a tolerance of DKK 1.
4. **Report and archive.** The results are written to `faktura_rapport_<date>.xlsx`, and each PDF is moved to `Godkendt` (approved), `Fejl` (errors) or `Mangler` (missing invoice number, or the amounts could not be calculated).

## Excel colours

| Colour | Meaning |
| --- | --- |
| Green row | The check passed |
| Red row | VAT or total is wrong. The status column says what it should be |
| Yellow row | The amounts could not be read or calculated |
| Yellow cell | The invoice number is missing |

## Run it

```
pip install -r requirements.txt
```

Create a file called `API.env` next to the script with your Anthropic key:

```
ANTHROPIC_API_KEY=your-key-here
```

Copy some PDFs from `sample-invoices/` into the same folder as `faktura-laesep.py`, then run:

```
python faktura-laesep.py
```

The script moves the PDFs it processes into the folders above, so run it on copies.

## Sample invoices

`sample-invoices/` holds four made-up invoices. Three of them are correct and `faktura_005.pdf` has a wrong VAT amount, so the red row shows up in the report.

## Interactive version

The VAT check from this script also runs as a small live demo in the Projects section of the portfolio site: https://lwmportfolioweb19.z1.web.core.windows.net
