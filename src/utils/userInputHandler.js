/**
 * @param {string} value - введенное пользователем значение
 * @param {React.SetStateAction} setUserInputState - изменение состояния управляемого компонента
 * @return {void} ничего не возвращает
 */
export default function userInputHandler(value, setUserInputState) {
  setUserInputState(value);
}
