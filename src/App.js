import React, { useCallback, useEffect, useState, useRef } from 'react';
import axios from 'axios';
 
const API_URL = 'https://api.openai.com/v1/';
const MODEL = 'gpt-3.5-turbo';
const API_KEY=process.env.REACT_APP_API_KEY;
 
const App = () => {
  // メッセージの状態管理用のステート
  const [ message, setMessage ] = useState( '' );
  // 回答の状態管理用のステート
  const [ answer, setAnswer ] = useState( '' );
  // 会話の記録用のステート
  const [ conversation, setConversation ] = useState( [] );
  // ローディング表示用のステート
  const [ loading, setLoading ] = useState( false );
  // 前回のメッセージの保持、比較用
  const prevMessageRef = useRef( '' );
 
  // 回答が取得されたとき
  useEffect( () => {
    // 直前のチャット内容
    const newConversation = [
      {
        'role': 'system',
        'content': "可愛い子猫のようなイメージで、さらに敬語は使わないで回答して欲しい",
      },
      {
        'role': 'user',
        'content': message,
      },
    ];
 
    // 会話の記録(直前のチャット内容の追加)
    setConversation( [ ...conversation, ...newConversation ] );
 
    // メッセージの消去(フォームのクリア)
    setMessage( '' );
  }, [ answer ] );
 
  // フォーム送信時の処理
  const handleSubmit = useCallback( async ( event ) => {
    event.preventDefault();
 
    // フォームが空のとき
    if ( !message ) {
      alert( 'メッセージがありません。' );
      return;
    }
 
    // APIリクエスト中はスルー
    if ( loading ) return;
 
    // APIリクエストを開始する前にローディング表示を開始
    setLoading( true );
 
    try {
      // API リクエスト
      const response = await axios.post( `${ API_URL }chat/completions`, {
        model: MODEL,
        messages: [
          ...conversation,
          {
            'role': 'user',
            'content': message,
          },
        ],
      }, {
        // HTTPヘッダー(認証)
        headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ API_KEY }`
        }
      });
 
      // 回答の取得
      setAnswer( response.data.choices[0].message.content.trim() );
 
    } catch ( error ) {
      // エラーハンドリング
      console.error( error );
 
    } finally {
      // 後始末
      setLoading( false );  // ローディング終了
      prevMessageRef.current = message; // 今回のメッセージを保持
    }
  }, [ loading, message, conversation ] );
 
  // チャット内容
  const ChatContent = React.memo(({ prevMessage, answer }) => {
    return (
      <div className="flex flex-col mt-4">
        <div className="flex flex-col items-start bg-gray-100 rounded-lg p-2">
          <p className="text-sm font-bold mb-2">あなた</p>
          <p className="text-base">{prevMessage}</p>
        </div>
        <div className="flex flex-col items-end bg-green-200 rounded-lg p-2 mt-2">
          <p className="text-sm font-bold mb-2">AI</p>
          <p className="text-base">{answer}</p>
        </div>
      </div>
    );
  });

  return (
    <div className='container mx-auto bg-white rounded-lg shadow-lg max-w-md'>
      <div className='bg-gray-100 px-4 py-2 rounded-t-lg'>
        <p className='text-center font-bold text-lg'>LINE風チャット</p>
      </div>
      <form className='px-4 py-2' onSubmit={handleSubmit}>
        <label>
          <textarea
            className='w-full border rounded-md p-2 focus:outline-none'
            rows='5'
            cols='50'
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
            }}
            placeholder='メッセージを入力してください'
          />
        </label>
        <div className='text-right mt-2'>
          <button
            type='submit'
            className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
          >
            送信
          </button>
        </div>
      </form>
      {loading && (
        <div className='text-center py-2'>
          <p>回答中...</p>
        </div>
      )}
      {answer && !loading && (
        <ChatContent prevMessage={prevMessageRef.current} answer={answer} />
      )}
    </div>
  );
};

export default App;