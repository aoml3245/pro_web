# -*- coding: utf-8 -*-
"""
Python용 한글 맞춤법 검사 모듈
"""

import requests
import json
import time
import sys
import re
from collections import OrderedDict
import xml.etree.ElementTree as ET
from urllib import parse

from . import __version__
from .response import Checked
from .constants import base_url
from .constants import CheckResult

_agent = requests.Session()
PY3 = sys.version_info[0] == 3

def read_token():
    try:
        with open("token.txt", "r") as f:
            TOKEN = f.read().strip()
    except FileNotFoundError:
        TOKEN = update_token()
    return TOKEN

def update_token():
    """Update passportKey from Naver search page"""
    html = _agent.get(url='https://search.naver.com/search.naver?where=nexearch&sm=top_hty&fbm=1&ie=utf8&query=맞춤법검사기') 
    match = re.search('passportKey=([a-zA-Z0-9]+)', html.text)
    if match is not None:
        TOKEN = parse.unquote(match.group(1))
        with open("token.txt", "w") as f:
            f.write(TOKEN)
    else:
        raise ValueError("Failed to retrieve passportKey")
    return TOKEN

def _remove_tags(text):
    text = u'<content>{}</content>'.format(text).replace('<br>', '')
    if not PY3:
        text = text.encode('utf-8')

    result = ''.join(ET.fromstring(text).itertext())

    return result

def check(text):
    """
    매개변수로 입력받은 한글 문장의 맞춤법을 체크합니다.
    """
    if isinstance(text, list):
        result = []
        for item in text:
            checked = check(item)
            result.append(checked)
        return result

    # 최대 500자까지 가능.
    if len(text) > 500:
        return Checked(result=False)

    passportKey = read_token()

    payload = {
        'passportKey': passportKey,
        'color_blindness': '0',
        'q': text
    }

    headers = {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36',
        'referer': 'https://search.naver.com/',
    }

    start_time = time.time()
    r = _agent.get(base_url, params=payload, headers=headers)
    passed_time = time.time() - start_time

    data = json.loads(r.text)
    if 'result' not in data['message']:
        passportKey = update_token()
        payload['passportKey'] = passportKey
        r = _agent.get(base_url, params=payload, headers=headers)
        data = json.loads(r.text)
        
    if 'result' not in data['message']:
        raise KeyError("'result' key not found in 'message'")

    html = data['message']['result']['html']
    result = {
        'result': True,
        'original': text,
        'checked': _remove_tags(html),
        'errors': data['message']['result']['errata_count'],
        'time': passed_time,
        'words': OrderedDict(),
    }

    html = html.replace('<em class=\'green_text\'>', '<green>') \
               .replace('<em class=\'red_text\'>', '<red>') \
               .replace('<em class=\'violet_text\'>', '<violet>') \
               .replace('<em class=\'blue_text\'>', '<blue>') \
               .replace('</em>', '<end>')
    items = html.split(' ')
    words = []
    tmp = ''
    for word in items:
        if tmp == '' and word[:1] == '<':
            pos = word.find('>') + 1
            tmp = word[:pos]
        elif tmp != '':
            word = u'{}{}'.format(tmp, word)
        
        if word[-5:] == '<end>':
            word = word.replace('<end>', '')
            tmp = ''

        words.append(word)

    for word in words:
        check_result = CheckResult.PASSED
        if word[:5] == '<red>':
            check_result = CheckResult.WRONG_SPELLING
            word = word.replace('<red>', '')
        elif word[:7] == '<green>':
            check_result = CheckResult.WRONG_SPACING
            word = word.replace('<green>', '')
        elif word[:8] == '<violet>':
            check_result = CheckResult.AMBIGUOUS
            word = word.replace('<violet>', '')
        elif word[:6] == '<blue>':
            check_result = CheckResult.STATISTICAL_CORRECTION
            word = word.replace('<blue>', '')
        result['words'][word] = check_result

    result = Checked(**result)

    return result
