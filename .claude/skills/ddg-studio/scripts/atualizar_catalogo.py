#!/usr/bin/env python3
"""Atualiza o catalogo da kie.ai: precos oficiais + campos de todos os modelos do Market.
Uso: python3 atualizar_catalogo.py   (precisa de PyYAML: pip3 install pyyaml)
Gera references/precos-kie-<data>.json e references/modelos-kie.json e mostra o que mudou."""
import json, re, datetime, pathlib, urllib.request, concurrent.futures as cf
import yaml
REF = pathlib.Path(__file__).resolve().parent.parent / "references"
UA = {"User-Agent": "Mozilla/5.0 (ddg-studio)"}

def precos():
    out, p = [], 1
    while True:
        req = urllib.request.Request("https://api.kie.ai/client/v1/model-pricing/page",
              data=json.dumps({"pageNum": p, "pageSize": 100}).encode(), headers={**UA, "Content-Type": "application/json"})
        r = json.load(urllib.request.urlopen(req, timeout=60))["data"]["records"]; out += r
        if len(r) < 100: return out
        p += 1

def merge_props(sch):
    props = dict(sch.get("properties", {})); req = set(sch.get("required", []))
    for key in ("oneOf", "anyOf", "allOf"):
        for sub in sch.get(key, []) or []:
            p, r = merge_props(sub)
            for k, v in p.items():
                if k in props and isinstance(v, dict) and v.get("maxItems", 0) > props[k].get("maxItems", 0):
                    props[k] = dict(props[k], maxItems=v["maxItems"])
                props.setdefault(k, v)
            if key == "allOf": req |= r
    return props, req

def esquemas():
    idx = urllib.request.urlopen(urllib.request.Request("https://docs.kie.ai/llms.txt", headers=UA), timeout=60).read().decode()
    urls = sorted(set(u for u in re.findall(r"https://docs\.kie\.ai/market/[^)\s]*\.md", idx)
                      if not re.search(r"/(chat|claude|gemini|grok|deepseek|kimi|codex)/|/market/(deepseek|kimi)", u)))
    def get(u):
        try: return u, urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=60).read().decode()
        except Exception: return u, ""
    out = {}
    with cf.ThreadPoolExecutor(8) as ex:
        for u, t in ex.map(get, urls):
            for blk in re.findall(r"^```yaml\n(.*?)^```", t, re.S | re.M):
                try: y = yaml.safe_load(blk)
                except Exception: continue
                if not isinstance(y, dict): continue
                for path, ops in (y.get("paths") or {}).items():
                    for op in ops.values():
                        if not isinstance(op, dict) or "requestBody" not in op: continue
                        body = op["requestBody"]["content"]["application/json"]; sch = body["schema"]
                        props = sch.get("properties", {}); mp = props.get("model") or {}
                        model = (mp.get("enum") or [mp.get("default")])[0]
                        tag = (op.get("tags") or [""])[0]
                        kind = "image" if "Image" in tag else "video" if "Video" in tag else "audio" if "Music" in tag else "other"
                        if "input" in props: ip, req = merge_props(props["input"])
                        else:
                            ip, req = merge_props(sch); ip.pop("model", None); ip.pop("callBackUrl", None)
                        fields = {}
                        for k, v in ip.items():
                            d = {"t": v.get("type")}
                            e = v.get("enum") or (v.get("items") or {}).get("enum")
                            if e and len(e) <= 40: d["enum"] = e
                            elif e: d["enum_n"] = len(e)
                            for a in ("default", "maxItems", "minimum", "maximum"):
                                if a in v: d[a] = v[a]
                            if k in req: d["req"] = 1
                            d["desc"] = re.sub(r"\s+", " ", v.get("description") or "")[:220]
                            fields[k] = d
                        ex_ = body.get("example") or (sch.get("examples") or [None])[0]
                        out[model or path] = {"doc": u, "title": op.get("summary"), "kind": kind, "path": path, "fields": fields,
                                              **({"example": ex_["input"]} if isinstance(ex_, dict) and ex_.get("input") else {})}
    return out

if __name__ == "__main__":
    hoje = datetime.date.today().isoformat()
    p = precos(); (REF / f"precos-kie-{hoje}.json").write_text(json.dumps(p, ensure_ascii=False, indent=0))
    velho = json.loads((REF / "modelos-kie.json").read_text()) if (REF / "modelos-kie.json").exists() else {}
    m = esquemas(); (REF / "modelos-kie.json").write_text(json.dumps(m, ensure_ascii=False, indent=1))
    print(f"precos: {len(p)} linhas -> precos-kie-{hoje}.json")
    print(f"modelos: {len(m)} (antes {len(velho)})")
    novos = sorted(set(m) - set(velho)); sairam = sorted(set(velho) - set(m))
    if novos: print("NOVOS:", ", ".join(novos))
    if sairam: print("SAIRAM:", ", ".join(sairam))
    print("Proximo passo: atualizar PRICES/ROUTER no kie.py, catalogo-modelos.md e roteador.md; testar o novo contra o atual com o mesmo prompt.")
