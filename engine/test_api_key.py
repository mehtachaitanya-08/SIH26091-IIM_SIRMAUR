"""
Test Script: Open Government Data (data.gov.in) Agmarknet API
Queries the daily mandi price for Wheat in Uttar Pradesh using the secure API key.
"""

import os
import json
import urllib.request
import urllib.parse
from config import get_data_gov_api_key

def test_agmarknet_api():
    api_key = get_data_gov_api_key()
    
    # Official OGD Agmarknet Resource ID
    resource_id = "9ef84268-d588-465a-a308-a864a43d0070"
    base_url = f"https://api.data.gov.in/resource/{resource_id}"
    
    params = {
        "api-key": api_key,
        "format": "json",
        "limit": 5,
        "filters[state]": "Uttar Pradesh",
        "filters[commodity]": "Wheat"
    }
    
    query_string = urllib.parse.urlencode(params)
    request_url = f"{base_url}?{query_string}"
    
    print(f"[*] Contacting Government Portal (data.gov.in)...")
    print(f"[*] Resource ID: {resource_id}")
    print(f"[*] Filters: State = Uttar Pradesh | Commodity = Wheat")
    
    req = urllib.request.Request(
        request_url,
        headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
    )
    
    try:
        with urllib.request.urlopen(req, timeout=15) as response:
            status_code = response.getcode()
            print(f"[+] HTTP Status Code: {status_code}")
            
            raw_data = response.read().decode("utf-8")
            data = json.loads(raw_data)
            
            records = data.get("records", [])
            total = data.get("total", len(records))
            
            print(f"[+] API Connection SUCCESSFUL!")
            print(f"[+] Total Matching Records in Database: {total}")
            print("\n" + "=" * 65)
            print("LIVE MANDI SPOT PRICE RESULTS (Direct from Government Portal)")
            print("=" * 65)
            
            if not records:
                print("No active records returned for today's filter. Showing raw response summary:")
                print(json.dumps(data, indent=2)[:500])
                return
            
            for idx, r in enumerate(records, 1):
                mkt = r.get("market", "N/A")
                dist = r.get("district", "N/A")
                cmd = r.get("commodity", "N/A")
                var = r.get("variety", "N/A")
                dt = r.get("arrival_date", "N/A")
                modal = r.get("modal_price", "N/A")
                min_p = r.get("min_price", "N/A")
                max_p = r.get("max_price", "N/A")
                
                print(f"{idx}. Market: {mkt} ({dist})")
                print(f"   Date: {dt} | Variety: {var}")
                print(f"   Modal Price: Rs. {modal}/Quintal (Min: Rs. {min_p} | Max: Rs. {max_p})")
                print("-" * 65)
                
    except urllib.error.HTTPError as e:
        print(f"[-] HTTP Error: {e.code} - {e.reason}")
        error_body = e.read().decode("utf-8")
        print(f"[-] Error details: {error_body}")
    except urllib.error.URLError as e:
        print(f"[-] Connection Error: {e.reason}")
    except Exception as e:
        print(f"[-] Unexpected Error: {str(e)}")

if __name__ == "__main__":
    test_agmarknet_api()

