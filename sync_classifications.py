import csv
import json
import urllib.request
import urllib.parse
import ssl

csv_file = 'PP_ KHSX TOTAL 26 - DATA Đặt Hàng 2026.csv'
url = 'https://script.google.com/macros/s/AKfycbyCUwPQbji4QRXS4E7KRQ3PERxlu-IByYSdJCXgeLucxFupJukqLq_0CdXKZpC7okKHsQ/exec'

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

update_map = {}

# Naive CSV parser for quoted fields
def parse_csv_line(text):
    ret = []
    val = ''
    in_quote = False
    for c in text:
        if c == '"':
            in_quote = not in_quote
        elif c == ',' and not in_quote:
            ret.append(val)
            val = ''
        else:
            val += c
    ret.append(val)
    return ret

with open(csv_file, 'r', encoding='utf-8-sig') as f:
    lines = f.readlines()

for line in lines[8:]:
    if not line.strip():
        continue
    cols = parse_csv_line(line.strip())
    if len(cols) > 17:
        stt = cols[0].strip()
        if not stt or not stt.isdigit():
            continue
        
        order_type = cols[1].strip()
        product_tier = cols[2].strip()
        partner = cols[17].strip()
        
        if stt and partner:
            stt_padded = stt.zfill(4)
            order_no = f"{stt_padded}/2026/PLMR-{partner}"
            
            if order_no not in update_map:
                update_map[order_no] = {
                    "orderType": order_type,
                    "productTier": product_tier
                }

print(f"Prepared mapping for {len(update_map)} orders.")

if len(update_map) > 0:
    payload = {
        "action": "updateClassifications",
        "data": {
            "updateMap": update_map
        }
    }
    
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'}, method='POST')
    
    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            res_body = response.read().decode('utf-8')
            res_json = json.loads(res_body)
            if res_json.get('success'):
                print(f"Success: {res_json.get('message')}")
            else:
                print(f"Failed: {res_json.get('message')}")
    except Exception as e:
        print(f"Error making request: {e}")
