import os
import re
from pathlib import Path

# Common magic numbers
PNG_START = b"\x89\x50\x4e\x47\x0d\x0a\x1a\x0a"
PNG_END = b"\x49\x45\x4e\x44\xae\x42\x60\x82"
JPG_START = b"\xff\xd8"
JPG_END = b"\xff\xd9"
GIF_START_89 = b"\x47\x49\x46\x38\x39\x61" # GIF89a
GIF_START_87 = b"\x47\x49\x46\x38\x37\x61" # GIF87a
GIF_END = b"\x00\x3b"

SIGNATURES = {
    b"PK\x03\x04": "ZIP archive",
    b"Rar!\x1a\x07": "RAR archive",
    b"7z\xbc\xaf\x27\x1c": "7-Zip archive",
    PNG_START: "PNG image",
    JPG_START: "JPEG image",
    GIF_START_89: "GIF image",
    GIF_START_87: "GIF image",
}

def get_printable_strings(data: bytes, min_len: int = 6) -> list:
    """Find ASCII strings in binary data (like strings command)."""
    pattern = re.compile(rf"[ -~]{{{min_len},}}")
    return pattern.findall(data.decode("ascii", errors="ignore"))

def analyze_image(file_path: str) -> str:
    """
    Pure Python implementation of steganography detection.
    Parses file signatures and extra data at the end of the file.
    """
    if not os.path.exists(file_path):
        return f"Error: File {file_path} not found."

    try:
        with open(file_path, "rb") as f:
            data = f.read()

        report = []
        file_size = len(data)
        
        # 1. Detect image format and locate EOI (End of Image)
        img_format = "Unknown"
        eoi_index = -1

        if data.startswith(PNG_START):
            img_format = "PNG"
            eoi_index = data.find(PNG_END)
            if eoi_index != -1:
                eoi_index += len(PNG_END)
        elif data.startswith(JPG_START):
            img_format = "JPG"
            eoi_index = data.rfind(JPG_END)
            if eoi_index != -1:
                eoi_index += len(JPG_END)
        elif data.startswith(GIF_START_89) or data.startswith(GIF_START_87):
            img_format = "GIF"
            eoi_index = data.rfind(GIF_END)
            if eoi_index != -1:
                eoi_index += len(GIF_END)

        report.append(f"Detected image format: {img_format}")
        report.append(f"File size: {file_size} bytes")

        if eoi_index == -1:
            report.append("Warning: Could not determine standard End of Image (EOI) marker.")
            eoi_index = file_size

        # 2. Check for trailing data (data appended after EOI)
        trailing_data_len = file_size - eoi_index
        if trailing_data_len > 0:
            trailing_bytes = data[eoi_index:]
            report.append(f"\n[!] ALERT: Found {trailing_data_len} bytes of trailing data after End of Image marker.")
            
            # Show a snippet of trailing data
            preview = trailing_bytes[:100]
            hex_preview = " ".join(f"{b:02x}" for b in preview)
            report.append(f"Hex Preview: {hex_preview}...")
            
            # Check for strings in trailing data
            trailing_strings = get_printable_strings(trailing_bytes, min_len=4)
            if trailing_strings:
                report.append("Extracted plain text strings from trailing data:")
                for s in trailing_strings[:10]:
                    report.append(f"  -> \"{s}\"")
        else:
            report.append("No trailing data found in file.")

        # 3. Check for embedded files (deep analysis magic number scan)
        report.append("\nPerforming deep analysis (signature scanning)...")
        found_embedded = False
        
        # We start checking after the header of the main image
        search_start = 8 if img_format == "PNG" else 2
        for sig, name in SIGNATURES.items():
            # Skip checking the host file format signature at the start
            if img_format == "PNG" and sig == PNG_START:
                continue
            if img_format == "JPG" and sig == JPG_START:
                continue
            if img_format == "GIF" and (sig == GIF_START_89 or sig == GIF_START_87):
                continue
                
            index = data.find(sig, search_start)
            if index != -1:
                found_embedded = True
                report.append(f"[!] Found embedded {name} at byte offset {index} (0x{index:x})")

        if not found_embedded:
            report.append("No embedded standard file signatures found.")

        # 4. Extract global strings
        report.append("\nExtracting main strings (length >= 6):")
        all_strings = get_printable_strings(data, min_len=6)
        if all_strings:
            report.append(f"Found {len(all_strings)} string sequences. Top strings:")
            for s in all_strings[:8]:
                report.append(f"  - {s}")
        else:
            report.append("No printable string sequences found.")

        return "\n".join(report)

    except Exception as e:
        return f"Error during analysis: {str(e)}"
