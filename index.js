/**
 * Desenvolvido por Hudson Andrade Viana
 * em 21 de janeiro de 2024
 */

// Global variables
const btnValueInFull = document.getElementById('btn-value-in-full');
const btnCopyFullText = document.getElementById('btn-copy-full-text');
const inputText = document.getElementById('input-value');
const response = document.getElementById('response');

const units = ['um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
const teens = ['onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
const tens = ['dez', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
const hundreds = ['cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

// Helpers
const checkValidation = (inputValue) => {
  const validation = [
    {
      test: isNaN(inputValue) || typeof inputValue !== 'number',
      msg: 'ERRO: O valor fornecido não é um número válido.',
    },
    {
      test: inputValue > 999999999999999,
      msg: 'ERRO: O valor fornecido é grande demais para ser escrito por extenso.',
    },
  ];

  const errorValidation = validation.find(({ test }) => test);
  return errorValidation?.msg;
};

const insertCharacterBetweenWords = (words, character) => {
  return words.flatMap((word, index) => (index < words.length - 1 ? [word, character] : [word]));
};

const getWords = (digit, arr) => {
  const indexToDeduct = arr === teens ? 11 : 1;
  return arr[digit - indexToDeduct];
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

const getClassSeparator = (className, remainder) => {
  if ((remainder > 100 && remainder % 100 !== 0) || (remainder > 1000 && remainder % 1000 !== 0)) {
    return ',';
  } else if (className && remainder && (remainder <= 100 || remainder % 100 === 0)) {
    return 'e';
  } else if (className && className !== 'mil' && !remainder) {
    return 'de';
  }
  return null;
};

// Main function
const getValueInFull = (inputValue) => {
  // Validation
  const errorValidation = checkValidation(inputValue);
  if (errorValidation) return errorValidation;

  const result = [];
  const stringValue = String(inputValue.toFixed(2));
  const [integerValue, fractionValue] = stringValue.split('.');
  const currencyName = integerValue == 1 ? 'real' : 'reais';
  const fractionName = fractionValue == 1 ? 'centavo' : 'centavos';

  // Get integer value in full
  if (integerValue > 0) {
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
        const classSeparator = getClassSeparator(className, remainder);
        result.push(classSeparator);
      }
    }

    result.push(currencyName);
  }

  // Get fraction value in full
  if (fractionValue > 0) {
    if (integerValue > 0) result.push('e');
    const charFractionArray = [...fractionValue];
    const wordsFractionArray = convertNumberToWords(charFractionArray);
    result.push(...wordsFractionArray);

    result.push(fractionName);
  }

  // Result
  const valueInFull = result
    .filter(Boolean)
    .join(' ')
    .replace(/\s*,\s*/g, ', ');

  return valueInFull;
};

// Get current year function
document.addEventListener('DOMContentLoaded', () => {
  const currentYear = new Date().getFullYear();
  document.querySelector('.current-year').innerHTML = currentYear;
  inputText.focus();
});

// Copy text functions
const copyTextToClipboard = (text) => navigator.clipboard.writeText(text);

const getClosestElement = (event, className) => event.target.closest('.input-group').querySelector(className);

const toggleButtonIcon = (btn, svgCopy, svgCheck) => {
  const tmpDataTooltipValue = btn.getAttribute('data-tooltip');
  btn.setAttribute('data-tooltip', 'Copiado!');
  svgCopy.style.display = 'none';
  svgCheck.style.display = 'inline-block';

  setTimeout(() => {
    svgCheck.style.display = 'none';
    svgCopy.style.display = 'inline-block';
    btn.setAttribute('data-tooltip', tmpDataTooltipValue);
  }, 1000);
};

const checkResponseValidation = (e) => {
  if (response.innerHTML) {
    return false;
  }
  e.preventDefault();
  return true;
};

// Listeners
btnValueInFull.addEventListener('click', () => {
  if (!inputText.value || inputText.value == 0) {
    alert('Digite um valor para escrever por extenso.');
    return;
  }

  const inputValue = Number(inputText.value.replace(/\./g, '').replace(',', '.'));

  if (!isNaN(inputValue)) {
    inputText.value = inputValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).replace('R$ ', '');
  }

  const result = getValueInFull(inputValue);
  response.innerText = result;
});

inputText.addEventListener('keyup', () => (response.innerText = ''));

response.addEventListener('focus', () => response.select());

document.body.addEventListener('click', (e) => {
  if (e.target.matches('[copy-button]')) {
    if (checkResponseValidation(e)) return;

    const element = getClosestElement(e, '.data-input');
    const btnCopy = getClosestElement(e, '.fVPVZX');
    const svgCopy = getClosestElement(e, '.copy');
    const svgCheck = getClosestElement(e, '.check');

    copyTextToClipboard(element.value || element.innerHTML);

    toggleButtonIcon(btnCopy, svgCopy, svgCheck);
  }
});

btnCopyFullText.addEventListener('click', (e) => {
  if (checkResponseValidation(e)) return;

  const fullText = `R$ ${inputText.value} (${response.innerHTML})`;

  copyTextToClipboard(fullText);

  const svgCopy = getClosestElement(e, '.copy');
  const svgCheck = getClosestElement(e, '.check');

  toggleButtonIcon(btnCopyFullText, svgCopy, svgCheck);
});
