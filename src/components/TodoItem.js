import React, { useEffect, useState, useRef } from 'react';
import { DatePicker } from '@mantine/dates';
import 'dayjs/locale/ru';
import dayjs from 'dayjs';
import './TodoItem.scss';
import FilesList from './FilesList';
import userInputHandler from '../utils/userInputHandler';
import {
  addTask,
  editTask,
  closeOpenTask,
  deleteTask,
  fileDownload,
} from '../firebase/firebaseCRUD';
import { Guid } from 'js-guid';

/**пропы setIsAddTask не обязателен и передаются
 * только в случае добавления задачи
 */
export default function TodoItem({ isCreate, setIsAddTask, taskInfo }) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [dateValue, setDateValue] = useState(undefined);
  const [files, setFiles] = useState([]);
  const [filesIdsToDelete, setFilesIdsToDelete] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const isChangeable = isCreate || isEdit;
  /**отметка о просроченности задачи.
   * в случае её завершения отметка не ставится.
   */
  const isOverdue =
    taskInfo && dayjs(taskInfo?.date).diff(dayjs(), 'days') < 1 && !isFinished;

  useEffect(() => {
    if (taskInfo) {
      setTitle(taskInfo.title);
      setDateValue(taskInfo.date);
      if (taskInfo.desc) setDesc(taskInfo.desc);
      if (taskInfo.isFinished) setIsFinished(taskInfo.isFinished);
      if (taskInfo.files) setFiles(taskInfo.files);
    }
    return () => {
      setTitle('');
      setDesc('');
      setDateValue(undefined);
      setFilesIdsToDelete([]);
    };
  }, [taskInfo, isEdit]);

  useEffect(() => {
    if (taskInfo) {
      closeOpenTask(taskInfo.id, isFinished);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinished]);

  const taskId = taskInfo && taskInfo?.id;

  return (
    <div className="item-container">
      <div className={isChangeable ? 'buttons' : 'buttons-icons'}>
        {buttonsRenderingOptions(
          title,
          desc,
          dateValue,
          taskId,
          files,
          setIsAddTask,
          isChangeable,
          setIsEdit,
          isFinished,
          setIsFinished,
          filesIdsToDelete
        )}
      </div>
      {renderingOptions(
        title,
        setTitle,
        desc,
        setDesc,
        dateValue,
        setDateValue,
        isChangeable,
        taskId,
        isFinished,
        isOverdue,
        setFiles,
        files,
        setFilesIdsToDelete
      )}
    </div>
  );
}

function buttonsRenderingOptions(
  title,
  desc,
  dateValue,
  taskId = null,
  files,
  setIsAddTask,
  isChangeable,
  setIsEdit,
  isFinished,
  setIsFinished,
  filesIdsToDelete
) {
  let buttons;

  if (isChangeable) {
    buttons = (
      <>
        <button
          className="task-btns"
          onClick={() => {
            taskId
              ? editTask(
                  taskId,
                  title,
                  desc,
                  dateValue,
                  files,
                  filesIdsToDelete,
                  setIsEdit
                )
              : /**проверка заполнения обязательных полей title и dateValue */
                !!title &&
                title !== '' &&
                !!dateValue &&
                addTask(title, desc, dateValue, files, setIsAddTask);
          }}
        >
          сохранить
        </button>
        <button
          className="task-btns"
          onClick={() => {
            taskId ? setIsEdit(false) : setIsAddTask(false);
          }}
        >
          отменить
        </button>
      </>
    );
  } else {
    buttons = (
      <>
        {/** отметить выполненной */}
        <svg
          onClick={() => {
            setIsFinished(!isFinished);
          }}
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 0 24 24"
          width="24px"
          fill="#000000"
        >
          <path d="M0 0h24v24H0z" fill="none" />
          <path
            d={
              isFinished
                ? 'M19 13H5v-2h14v2z'
                : 'M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z'
            }
          />
        </svg>

        {/** редактирование */}
        <svg
          onClick={() => setIsEdit(true)}
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 0 24 24"
          width="24px"
          fill="#000000"
        >
          <path d="M0 0h24v24H0z" fill="none" />
          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
        </svg>

        {/** удаление */}
        <svg
          onClick={() => {
            if (!isFinished) {
              window.confirm(
                `Удалить задачу "${title}" и все прикреплённые к ней файлы?`
              ) && deleteTask(taskId);
            }
          }}
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 0 24 24"
          width="24px"
          fill={isFinished ? '#9e9e9e' : '#000000'}
        >
          <path d="M0 0h24v24H0z" fill="none" />
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
        </svg>
      </>
    );
  }
  return buttons;
}

function renderingOptions(
  title,
  setTitle,
  desc,
  setDesc,
  dateValue,
  setDateValue,
  isChangeable,
  taskId,
  isFinished,
  isOverdue,
  setFiles,
  files,
  setFilesIdsToDelete
) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const filePicker = useRef(null);
  const filePickerRender = (
    <>
      {' '}
      <button className="task-btns" onClick={() => filePicker.current.click()}>
        Прикрепить файл
      </button>
      <input
        className="file-picker"
        ref={filePicker}
        type={'file'}
        onChange={(e) => {
          const filesToUpload = Array.from(e.target.files);
          filesToUpload.forEach(
            (item) => (item.id = Guid.newGuid().StringGuid.replaceAll('-', ''))
          );
          setFiles((prev) => [...prev, ...filesToUpload]);
        }}
        multiple
        //TODO добавить и другие форматы файлов в свойство accept
        accept="image/*, .pdf, text/*, .docx, .doc, .xlsx, .xls"
      />
    </>
  );
  let render;
  /**создание */
  if (isChangeable && !taskId) {
    render = (
      <>
        <form>
          <input
            placeholder="введите название задачи*"
            className="title"
            onChange={(e) => userInputHandler(e.target.value, setTitle)}
            value={title}
          />
          <textarea
            placeholder="введите описание задачи"
            className="desc"
            onChange={(e) => userInputHandler(e.target.value, setDesc)}
            value={desc}
          />
        </form>
        <div className="date">
          <DatePicker
            className="date-picker"
            locale="ru"
            placeholder="Выберите дату*"
            // defaultValue={new Date()}
            value={dateValue}
            onChange={(e) => setDateValue(dayjs(e).valueOf())}
          />
        </div>
        <div className="file">
          {files && !!files.length && (
            <FilesList
              files={files}
              setFiles={setFiles}
              setFilesIdsToDelete={null}
            />
          )}
          {filePickerRender}
        </div>
      </>
    );
    /**редактирование */
  } else if (isChangeable && taskId) {
    render = (
      <>
        <form>
          <input
            className="title"
            onChange={(e) => userInputHandler(e.target.value, setTitle)}
            value={title}
          />
          <textarea
            className="desc"
            onChange={(e) => userInputHandler(e.target.value, setDesc)}
            value={desc}
          />
        </form>
        <div className="date">
          <DatePicker
            className="date-picker"
            locale="ru"
            placeholder="Выберите дату*"
            defaultValue={new Date(dateValue)}
            onChange={(e) => setDateValue(dayjs(e).valueOf())}
          />
        </div>
        <div className="file">
          <FilesList
            files={files}
            setFiles={setFiles}
            setFilesIdsToDelete={setFilesIdsToDelete}
          />
          {filePickerRender}
        </div>
      </>
    );
    /**просмотр */
  } else {
    render = (
      <>
        <form>
          <div className={`title ${isFinished ? 'finished-task' : ''}`}>
            {title}
            {isOverdue && <div className="overdue">Просрочено</div>}
          </div>
          <div className={`desc ${isFinished ? 'finished-task' : ''}`}>
            {desc}
          </div>
        </form>
        <div className="date">
          <DatePicker
            className="date-picker"
            locale="ru"
            value={new Date(dateValue)}
            disabled
          />
        </div>
        <div className="file">
          {files && (
            <ul className="attached-files">
              {files.map((file) => (
                <li key={file.id} onClick={() => fileDownload(file.id, file.name)}>
                  {file.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </>
    );
  }

  return render;
}
