import pdfplumber
import pandas as pd
import os
import anthropic
from datetime import date
from openpyxl import load_workbook
from openpyxl.styles import PatternFill, Font, Alignment
from dotenv import load_dotenv

load_dotenv("API.env")
api_key = os.getenv("ANTHROPIC_API_KEY")

if not api_key:
    print("FEJL: Kunne ikke finde API-nøglen i API.env filen!")
    exit()

client = anthropic.Anthropic(api_key=api_key)

def sporg_ai(faktura_tekst):
    besked = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=500,
        messages=[{
            "role": "user",
            "content": f"""
            Analyser denne faktura og returner KUN følgende informationer i præcis dette format:
            
            LEVERANDOER: [navn på virksomheden der sender fakturaen]
            FAKTURANUMMER: [fakturanummer, eller MANGLER hvis ikke fundet]
            DATO: [fakturadato]
            SUBTOTAL: [beløb uden moms]
            MOMS: [momsbeløb med valuta]
            TOTAL: [det samlede beløb med valuta]
            
            Faktura tekst:
            {faktura_tekst}
            """
        }]
    )
    return besked.content[0].text

def verificer_moms(subtotal_tekst, moms_tekst, total_tekst):
    try:
        moms = float(moms_tekst.replace("DKK", "").replace(".", "").replace(",", ".").strip())
        total = float(total_tekst.replace("DKK", "").replace(".", "").replace(",", ".").strip())
        subtotal = float(subtotal_tekst.replace("DKK", "").replace(".", "").replace(",", ".").strip())

        forventet_moms = subtotal * 0.25
        forventet_total = subtotal + forventet_moms

        fejl_liste = []

        if abs(moms - forventet_moms) > 1:
            fejl_liste.append(f"Moms forkert (burde vaere DKK {forventet_moms:,.2f})")

        if abs(total - forventet_total) > 1:
            fejl_liste.append(f"Total forkert (burde vaere DKK {forventet_total:,.2f})")

        if fejl_liste:
            return "FEJL - " + " | ".join(fejl_liste)
        return "OK"
    except:
        return "Kunne ikke beregne"

def parse_ai_svar(ai_svar):
    resultat = {
        "Leverandoer": "MANGLER",
        "Fakturanummer": "MANGLER",
        "Dato": "MANGLER",
        "Subtotal": "MANGLER",
        "Moms": "MANGLER",
        "Total": "MANGLER",
        "Status": "MANGLER"
    }
    for linje in ai_svar.split("\n"):
        if "LEVERANDOER:" in linje:
            resultat["Leverandoer"] = linje.split(":", 1)[-1].strip()
        elif "FAKTURANUMMER:" in linje:
            resultat["Fakturanummer"] = linje.split(":", 1)[-1].strip()
        elif "DATO:" in linje:
            resultat["Dato"] = linje.split(":", 1)[-1].strip()
        elif "SUBTOTAL:" in linje:
            resultat["Subtotal"] = linje.split(":", 1)[-1].strip()
        elif "MOMS:" in linje:
            resultat["Moms"] = linje.split(":", 1)[-1].strip()
        elif "TOTAL:" in linje:
            resultat["Total"] = linje.split(":", 1)[-1].strip()

    resultat["Status"] = verificer_moms(
        resultat["Subtotal"],
        resultat["Moms"],
        resultat["Total"]
    )
    return resultat

def laes_faktura(filnavn):
    try:
        with pdfplumber.open(filnavn) as pdf:
            tekst = pdf.pages[0].extract_text()
        if not tekst:
            return None
        print(f"  Sender til AI...")
        ai_svar = sporg_ai(tekst)
        resultat = parse_ai_svar(ai_svar)
        resultat["Filnavn"] = filnavn
        return resultat
    except Exception as fejl:
        print(f"Fejl ved reading af {filnavn}: {fejl}")
        return None

# ─── HOVED-PROGRAM ───────────────────────────────────────

print("Starter AI faktura-reader...\n")

alle_fakturaer = []

for filnavn in os.listdir("."):
    if filnavn.endswith(".pdf"):
        print(f"Reading: {filnavn}")
        data = laes_faktura(filnavn)
        if data:
            alle_fakturaer.append(data)

if not alle_fakturaer:
    print("Ingen fakturaer fundet")
else:
    df = pd.DataFrame(alle_fakturaer)
    dags_dato = date.today().strftime("%d-%m-%Y")
    excel_filnavn = f"faktura_rapport_{dags_dato}.xlsx"
    df.to_excel(excel_filnavn, index=False)

    wb = load_workbook(excel_filnavn)
    ws = wb.active

    header_farve = PatternFill("solid", fgColor="1B3A5C")
    header_font = Font(bold=True, color="FFFFFF")
    for celle in ws[1]:
        celle.fill = header_farve
        celle.font = header_font
        celle.alignment = Alignment(horizontal="center")

    groen = PatternFill("solid", fgColor="C6EFCE")
    roed = PatternFill("solid", fgColor="FF0000")
    gul = PatternFill("solid", fgColor="FFEB9C")

    COL_FAKTURANUMMER = 1
    COL_SUBTOTAL = 3
    COL_MOMS = 4
    COL_TOTAL = 5
    COL_STATUS = 6

    for raekke in ws.iter_rows(min_row=2):
        status = raekke[COL_STATUS].value
        fakturanummer = raekke[COL_FAKTURANUMMER].value

        # Farv hele rækken grøn som standard
        for celle in raekke:
            celle.fill = groen

        # Farv hele rækken grøn som standard
        for celle in raekke:
            celle.fill = groen

        # Farv hele rækken rød hvis der er en fejl
        if status and "FEJL" in status:
            for celle in raekke:
                celle.fill = roed

        # Farv fakturanummer gul hvis det mangler
        if fakturanummer and "MANGLER" in fakturanummer:
            raekke[COL_FAKTURANUMMER].fill = gul

        # Farv hele rækken gul hvis status ikke kunne beregnes
        if status and "Kunne ikke beregne" in status:
            for celle in raekke:
                celle.fill = gul

    # Juster kolonnebredde automatisk
    for kolonne in ws.columns:
        max_laengde = 0
        for celle in kolonne:
            if celle.value:
                max_laengde = max(max_laengde, len(str(celle.value)))
        ws.column_dimensions[kolonne[0].column_letter].width = max_laengde + 6

    wb.save(excel_filnavn)

    print(f"\nDone :) {len(alle_fakturaer)} fakturaer behandlet.")
    print(f"Rapport gemt som: {excel_filnavn}")

        # Opret mapper hvis de ikke findes
    os.makedirs("Godkendt", exist_ok=True)
    os.makedirs("Fejl", exist_ok=True)
    os.makedirs("Mangler", exist_ok=True)

    # Flyt hver faktura til den rigtige mappe
    for faktura in alle_fakturaer:
        filnavn = faktura["Filnavn"]
        status = faktura["Status"]
        fakturanummer = faktura["Fakturanummer"]

        if "FEJL" in status:
            destination = os.path.join("Fejl", filnavn)
        elif fakturanummer == "MANGLER" or status == "Kunne ikke beregne":
            destination = os.path.join("Mangler", filnavn)
        else:
            destination = os.path.join("Godkendt", filnavn)

        os.rename(filnavn, destination)
        print(f"  Flyttet {filnavn} -> {destination}")

