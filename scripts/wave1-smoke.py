import json, sys, urllib.request

URL = "http://127.0.0.1:3000/mcp"
P = "db://assets/mcp-wave1-test/SmokeProbe.ts"


def call(method, params, rid=1):
    body = json.dumps({"jsonrpc": "2.0", "id": rid, "method": method, "params": params}).encode()
    req = urllib.request.Request(URL, data=body, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode())


def tool(name, args, rid=1):
    resp = call("tools/call", {"name": name, "arguments": args}, rid)
    return json.loads(resp["result"]["content"][0]["text"])


# 1. create
c = tool("script_create", {"path": P, "template": "component", "className": "SmokeProbe"}, 1)
print("1. create:", "OK" if c["success"] and c["data"]["created"] else "FAIL")

# 2. read — verify @ccclass + sha format
r = tool("script_read", {"path": P}, 2)
data = r["data"]
print("2. read:", "OK" if "@ccclass('SmokeProbe')" in data["content"] and data["sha"].startswith("sha256:") else "FAIL",
      "| sha=" + data["sha"][:24] + "... | eol=" + data["eol"])
sha = data["sha"]

# 3. get_sha — verify no content field, sha matches
g = tool("script_get_sha", {"path": P}, 3)
print("3. get_sha:", "OK" if ("content" not in g["data"] and g["data"]["sha"] == sha) else "FAIL")

# 4. search — verify matches + db:// URLs
s = tool("search_code", {"query": "SmokeProbe", "include": ["**/*.ts"]}, 4)
matches = s["data"]["matches"]
all_db = all(m["path"].startswith("db://assets/") for m in matches)
print("4. search:", "OK" if len(matches) >= 1 and all_db else "FAIL",
      "| matches=" + str(len(matches)) + " | scanned=" + str(s["data"]["scannedFiles"]))

# 5. delete wrong sha — expect CONFLICT, isError
import urllib.error
d = tool("script_delete", {"path": P, "expectedSha": "sha256:" + "0" * 64}, 5)
print("5. delete wrong sha:", "OK" if d.get("success") is False and d["error"]["code"] == "CONFLICT" else "FAIL",
      "| code=" + d["error"]["code"])

# 6. delete correct sha
d2 = tool("script_delete", {"path": P, "expectedSha": sha}, 6)
print("6. delete correct sha:", "OK" if d2["success"] and d2["data"]["deleted"] else "FAIL")

# 7. search after delete — expect 0 matches
s2 = tool("search_code", {"query": "SmokeProbe", "include": ["**/*.ts"]}, 7)
print("7. search after delete:", "OK" if len(s2["data"]["matches"]) == 0 else "FAIL")

# 8. missing file — expect NOT_FOUND
nf = tool("script_get_sha", {"path": "db://assets/mcp-wave1-test/Missing.ts"}, 8)
print("8. missing file:", "OK" if nf.get("success") is False and nf["error"]["code"] == "NOT_FOUND" else "FAIL",
      "| code=" + nf["error"]["code"])

# 9. selection resource
sel = call("resources/read", {"uri": "cocos://editor/selection"}, 9)
snap = json.loads(sel["result"]["contents"][0]["text"])
print("9. selection:", "OK" if snap["source"]["selected"] == "selection:query-selection" else "FAIL",
      "| selected=" + str(len(snap["selected"])) + " | active=" + str(snap["active"]) +
      " | activeSource=" + snap["source"]["active"])
