const btnValueInFull = document.getElementById('btn-value-in-full');
const inputValue = document.getElementById('input-value');
const response = document.getElementById('response');

btnValueInFull.addEventListener('click', () => {
  if (!inputValue.value || inputValue.value == 0) {
    alert('Digite um valor para escrever por extenso.');
    return;
  }

  const inputValueSanitized = inputValue.value.replace(/\./g, '').replace(',', '.');

  const result = getValueInFull(+inputValueSanitized);
  response.innerText = result;
});

inputValue.addEventListener('keyup', (e) => (response.innerText = ''));

const getValueInFull = (inputValue) => {
  const validation = [
    {
      test: typeof inputValue !== 'number',
      msg: 'ERRO: O valor fornecido não é um número válido.',
    },
    {
      test: inputValue > 999999999999999,
      msg: 'ERRO: O valor fornecido é grande demais para ser convertido por extenso.',
    },
  ];

  const errorValidation = validation.find((check) => check.test);

  if (errorValidation) {
    return errorValidation.msg;
  }

  const result = [];
  const stringValue = String(inputValue.toFixed(2));
  const [integerValue, fractionValue] = stringValue.split('.');
  const currencyName = integerValue == 1 ? 'real' : 'reais';
  const fractionName = fractionValue == 1 ? 'centavo' : 'centavos';

  const units = ['um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
  const teens = ['onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
  const tens = ['dez', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  const hundreds = ['cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

  const insertCharacterBetweenWords = (words, character) => {
    return words.flatMap((word, index) => (index < words.length - 1 ? [word, character] : [word]));
  };

  const getWords = (value, arr) => {
    const indexToDeduct = arr === teens ? 11 : 1;
    return arr[value - indexToDeduct];
  };

  const convertNumberToWords = (numArray) => {
    const words = [];
    const digits = numArray.length;
    const firstDigit = numArray[0];
    const middleDigit = numArray[1];
    const lastDigit = numArray[digits - 1];
    const lastTwoDigits = numArray.slice(-2).join('');

    if (digits === 3) {
      if (numArray.join('') == 100) {
        words.push('cem');
      } else {
        words.push(getWords(firstDigit, hundreds));
        if (lastTwoDigits > 0 && lastTwoDigits < 10) {
          words.push(getWords(lastDigit, units));
        } else if (lastTwoDigits == 10) {
          words.push(getWords(middleDigit, tens));
        } else if (lastTwoDigits > 10 && lastTwoDigits <= 19) {
          words.push(getWords(lastTwoDigits, teens));
        } else if (lastTwoDigits > 19) {
          words.push(getWords(middleDigit, tens));
          if (lastDigit != 0) {
            words.push(getWords(lastDigit, units));
          }
        }
      }
    }

    if (digits === 2) {
      if (lastTwoDigits > 0 && lastTwoDigits < 10) {
        words.push(getWords(lastDigit, units));
      } else if (lastTwoDigits == 10) {
        words.push(getWords(firstDigit, tens));
      } else if (lastTwoDigits > 10 && lastTwoDigits <= 19) {
        words.push(getWords(lastTwoDigits, teens));
      } else if (lastTwoDigits > 19) {
        words.push(getWords(firstDigit, tens));
        if (lastDigit != 0) {
          words.push(getWords(lastDigit, units));
        }
      }
    }

    if (digits === 1) {
      words.push(getWords(lastDigit, units));
    }

    const wordsSanitized = words.filter(Boolean);
    const resultWords = insertCharacterBetweenWords(wordsSanitized, 'e');
    return resultWords;
  };

  // GET INTEGER PART IN FULL

  if (integerValue > 0) {
    const splitNumberIntoClasses = (inputNumber) => {
      return inputNumber.match(/.{1,3}(?=(.{3})*$)/g);
    };

    const getClassName = (value, orderClass) => {
      const classes = {
        2: 'mil',
        3: value == 1 ? 'milhão' : 'milhões',
        4: value == 1 ? 'bilhão' : 'bilhões',
        5: value == 1 ? 'trilhão' : 'trilhões',
      };
      return value != 0 ? classes[orderClass] : null;
    };

    const insertClassSeparator = (className, remainder) => {
      if ((remainder > 100 && remainder % 100 !== 0) || (remainder > 1000 && remainder % 1000 !== 0)) {
        result.push(',');
      } else if (className && remainder && (remainder <= 100 || remainder % 100 === 0)) {
        result.push('e');
      } else if (className && className !== 'mil' && !remainder) {
        result.push('de');
      }
    };

    const integerSplitIntoClasses = splitNumberIntoClasses(integerValue);
    let orderClass = integerSplitIntoClasses.length;

    for (let i = 0; i < integerSplitIntoClasses.length; i++) {
      const charIntegerArray = [...integerSplitIntoClasses[i]];
      const wordsIntegerArray = convertNumberToWords(charIntegerArray);
      result.push(...wordsIntegerArray);

      const className = getClassName(integerSplitIntoClasses[i], orderClass);
      result.push(className);
      orderClass--;

      if (wordsIntegerArray.length) {
        const remainder = integerSplitIntoClasses
          .slice(i + 1)
          .filter((value) => value !== '000')
          .join('');
        insertClassSeparator(className, remainder);
      }
    }

    result.push(currencyName);
  }

  // GET FRACTION PART IN FULL

  if (fractionValue > 0) {
    if (integerValue > 0) result.push('e');
    const charFractionArray = [...fractionValue];
    const wordsFractionArray = convertNumberToWords(charFractionArray);
    result.push(...wordsFractionArray);

    result.push(fractionName);
  }

  const valueInFull = result
    .filter(Boolean)
    .join(' ')
    .replace(/\s*,\s*/g, ', ');

  return valueInFull;
};
