import React, { useState, useEffect } from 'react';
import { collection, getDocs, onSnapshot, query } from 'firebase/firestore';
import TodoItem from './TodoItem';
import './TodoList.scss';
import { db } from '../firebase/firebaseConfig';

let unsubscriber;

export default function TodoList() {
  const [data, setData] = useState([]);
  const [isAddTask, setIsAddTask] = useState(false);
  useEffect(() => {
    const queryTasksSnapshot = query(collection(db, 'tasks'));
    unsubscriber = onSnapshot(queryTasksSnapshot, (querySnapshot) =>
      setData(
        querySnapshot.docs.map((doc) => {
          let item = doc.data();
          item.id = doc.id;
          return item;
        })
      )
    );
    return () => {
      unsubscriber();
      setData(null);
    };
  }, []);

  return (
    <section className="list-container">
      <header className="list-header">
        {/* <div className="item-container"> */}
        <div className="button">
          {!isAddTask && (
            <button onClick={() => setIsAddTask(true)}>+ добавить</button>
          )}
          {isAddTask && (
            <button onClick={() => setIsAddTask(false)}>отмена</button>
          )}
        </div>
        <div className="task">
          <h4 className="title">Задача</h4>
          {/* <p className="desc">Описание</p> */}
        </div>
        <div className="date">
          <h4>Планируемая дата завершения</h4>
        </div>
        <div className="file">
          <h4>Вложение</h4>
        </div>
        {/* </div> */}
      </header>

      {isAddTask && (
        <TodoItem isCreate={isAddTask} setIsAddTask={setIsAddTask} />
      )}

      {data &&
        !!data.length &&
        data.map((item) => (
          <TodoItem isCreate={false} taskInfo={item} key={item.id} />
        ))}
    </section>
  );
}
