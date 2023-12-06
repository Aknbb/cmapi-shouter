import React, {useState} from 'react';

const SearchUtils = {
    maxSearchResultLength: 30,
};

SearchUtils.useKeyPress = function (targetKey) {
    const [keyPressed, setKeyPressed] = useState(false);

    function downHandler({key}) {
        if (key === targetKey) {
            setKeyPressed(true);
        }
    }

    const upHandler = ({key}) => {
        if (key === targetKey) {
            setKeyPressed(false);
        }
    };

    React.useEffect(() => {
        window.addEventListener('keydown', downHandler);
        window.addEventListener('keyup', upHandler);

        return () => {
            window.removeEventListener('keydown', downHandler);
            window.removeEventListener('keyup', upHandler);
        };
    });

    return keyPressed;
};

SearchUtils.getDetailedSearchResults = (searchedDocuments, searchWord, matchCaseOption, wordsOption) => {
    const searchFlag = matchCaseOption ? 'g' : 'gi';
    const regexText = wordsOption ? `(?<=[\\s,.:;"']|^)${searchWord}(?=[\\s,.:;"']|$)` : searchWord;
    const searchRegex = new RegExp(regexText, searchFlag);
    const result = [];
    let id = 0;
    searchedDocuments.forEach(searchDocument => {
        const previewMessage = objectToFormattedText(searchDocument);
        const lines = previewMessage.split('\n');
        const findResults = findAll(lines, searchRegex, searchWord, previewMessage, id, searchDocument);
        id = id + findResults.length;
        result.push(...findResults);
    });
    return result;
};

const Range = function (startRow, startColumn, endRow, endColumn) {
    this.start = {
        row: startRow,
        column: startColumn,
    };

    this.end = {
        row: endRow,
        column: endColumn,
    };
};

const findAll = function (lines, regex, searchWord, previewMessage, id, searchDocument) {
    let reservedKeywords = [
        '"channel"',
        '"title"',
        '"labels"',
        '"message"',
    ];
    const results = [];
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        let reservedIndexes;
        const line = lines[lineIndex];
        if (reservedKeywords.length > 0) {
            for (let reversedKeyword of reservedKeywords) {
                if (line.indexOf(reversedKeyword) > -1) {
                    reservedIndexes = {
                        start: line.indexOf(reversedKeyword),
                        end: line.indexOf(reversedKeyword) + reversedKeyword.length,
                    };
                    reservedKeywords = reservedKeywords.filter(keyword => keyword !== reversedKeyword);
                    break;
                }
            }
        }
        const matches = getMatchOffsets(line, regex);
        for (let matchesIndex = 0; matchesIndex < matches.length; matchesIndex++) {
            const match = matches[matchesIndex];
            if (reservedIndexes && (match.offset >= reservedIndexes.start && match.offset <= reservedIndexes.end)) {
                continue;
            }
            let searchResultText = line;
            if (line.length > SearchUtils.maxSearchResultLength) {
                const offset = Math.round((SearchUtils.maxSearchResultLength - searchWord.length) / 2);
                searchResultText = line.substring(match.offset - offset, match.offset) + line.substring(match.offset, match.offset + searchWord.length + offset);
            }
            results.push({
                id,
                ...searchDocument,
                searchResultText,
                previewMessage,
                range: new Range(lineIndex, match.offset, lineIndex, match.offset + match.length),
            });
            id++;
        }
    }
    return results;
};

const getMatchOffsets = function (string, regExp) {
    const matches = [];

    string.replace(regExp, function (str) {
        matches.push({
            offset: arguments[arguments.length - 2],
            length: str.length,
        });
    });

    return matches;
};

const objectToFormattedText = (document) => {
    const content = {...document};
    delete content.id;
    if (typeof content.message === 'string') {
        content.message = JSON.parse(content.message);
    }
    return JSON.stringify(content, undefined, 2);
};

export default SearchUtils;
