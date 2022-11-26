import {
  collection,
  addDoc,
  getDoc,
  updateDoc,
  doc,
  deleteDoc,
} from 'firebase/firestore';
import { db, storage } from './firebaseConfig';
import {
  deleteObject,
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import extractFileExtention from '../utils/extractFileExtention';

export let unsubscriber;

/**добавлеие файлов к задаче */
async function addFiles(files) {
  files.forEach((file) => {
    const extention = extractFileExtention(file.name);
    const userFile = ref(storage, `attachedFiles/${file.id}${extention}`);
    uploadBytes(userFile, file)
      // .then(() => console.log('файл загружен на сервер: ', file.id))
      .catch((e) => console.error('ошибка загрузки файла: ', e));
  });
}

/**добавление задачи */
export async function addTask(title, desc, date, files, setIsAddTask) {
  const filesIds = [];
  if (files.length > 0)
    files.forEach((file) => filesIds.push({ id: file.id, name: file.name }));
  try {
    await addDoc(collection(db, 'tasks'), {
      title,
      desc,
      date,
      files: filesIds,
    });
    setIsAddTask(false);
    if (files.length > 0) await addFiles(files);
  } catch (e) {
    console.error('Error in addTask: ', e);
  }
}

/**редактирование задачи */
export async function editTask(
  id,
  title,
  desc,
  date,
  files,
  filesIdsToDelete,
  setIsEdit
) {
  const filesIds = [];
  if (files.length > 0)
    files.forEach((file) => filesIds.push({ id: file.id, name: file.name }));
  const filesToUpload = [];
  files.forEach((file) => {
    if (!!file.size) filesToUpload.push(file);
  });
  try {
    if (filesIdsToDelete && filesIdsToDelete.length > 0) {
      deleteFiles(filesIdsToDelete);
    }
    //TODO тут добавить файлы
    if (filesToUpload && filesToUpload.length > 0) {
      addFiles(filesToUpload);
    }
    await updateDoc(doc(db, 'tasks', id), {
      title,
      desc,
      date,
      files: filesIds,
    });
    setIsEdit(false);
  } catch (e) {
    console.log('ERROR in editTask:', e);
  }
}

/**отметить задачу выполненной/снять отметку */
export async function closeOpenTask(id, isFinished) {
  try {
    await updateDoc(doc(db, 'tasks', id), {
      isFinished,
    });
  } catch (e) {
    console.log('ERROR in closeTask:', e);
  }
}

/**удалить задачу */
export async function deleteTask(id) {
  try {
    await deleteAllFiles(id);
    await deleteDoc(doc(db, 'tasks', id));
  } catch (e) {
    console.log('ERROR in deleteTask:', e);
  }
}
/**удаление всех привязанных к задаче файлов */
async function deleteAllFiles(id) {
  const taskRef = doc(db, 'tasks', id);
  const taskSnap = await getDoc(taskRef);
  const attFls = taskSnap.data().files;
  if (attFls && attFls.length > 0) {
    attFls.forEach((item) => {
      const fileRef = ref(
        storage,
        `attachedFiles/${item.id}${extractFileExtention(item.name)}`
      );
      deleteObject(fileRef)
        // .then(() => console.log('файл удален: ', item.id))
        .catch((e) => console.error('ошибка удаления файла: ', e));
    });
  }
}

/**удаление файлов при редактировании задачи
 * принимает массив id-шников файлов
 */
async function deleteFiles(ids) {
  ids.forEach((id) => {
    const fileRef = ref(storage, `attachedFiles/${id}`);
    deleteObject(fileRef)
      // .then(() => console.log('файл удален: ', id))
      .catch((e) => console.error('ошибка удаления файла: ', e));
  });
}

export function fileDownload(id, name) {
  const extention = extractFileExtention(name);
  // console.log('name: ', extractFileExtention(name));
  // const fileRef = ref(storage, `attachedFiles/${id}`);
  const fileRef = ref(storage, `attachedFiles/${id}${extention}`);
  getDownloadURL(fileRef)
    .then((url) => {
      window.open(url, '_blank');
    })
    .catch((e) => console.error('возникли проблемы с загрузкой файла: ', e));
}
