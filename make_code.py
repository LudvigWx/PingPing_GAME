"""Make a Trepong redeem code.

Usage:  python make_code.py "MY-SECRET-CODE"

Prints the line to paste into the CODES table in trepong.html (search for "const CODES").
Only the hash ends up in the game, so people reading the source can't see the code itself.
Codes are case-insensitive and spaces/dashes don't matter (GHOST-PADDLE == ghost paddle).
"""
import hashlib, re, sys

def norm(code):
    return re.sub(r'[^A-Z0-9]', '', code.upper())

def code_hash(code):
    return hashlib.sha256(('trepong:' + norm(code)).encode()).hexdigest()

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(__doc__); sys.exit(1)
    code = ' '.join(sys.argv[1:])
    print('Code:', norm(code))
    print("  '%s': { n: 'NAME SHOWN WHEN REDEEMED', r: [['coins', 200]], end: Date.parse('2026-12-31') }," % code_hash(code))
    print("Rewards: ['coins', N], ['chest', 'wood'|'gold'|...], or any cosmetic like ['h', 'witch'], ['pe', 'candycorn'], ['pt', 'codebreaker'].")
    print("Leave out end: for a code that never expires.")
