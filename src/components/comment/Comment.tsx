import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { CommentsHistory } from "../interface/CommentHistory";
import CommmentHistoryDataImport from "@/utils/json/commentHistory.json"
import { useEffect, useRef, useState } from "react";


export default function Comments() {
    const [newCommentMessage, setNewCommentMessage] = useState<string>('');
    const commentsContainerRef = useRef<HTMLDivElement>(null);
    const [CommmentHistoryData,setCommmentHistoryData] = useState(CommmentHistoryDataImport)
     const handleNewComment = () => {
        if (newCommentMessage.trim() === '') {
            return; 
        }
        
        const newComment: CommentsHistory = {
            id: Date.now().toString(), 
            caseid: "CASE" + Math.floor(Math.random() * 1000).toString().padStart(3, '0'), 
            name: "Current User", 
            date: new Date().toLocaleDateString('en-US'), 
            message: newCommentMessage,
        };
        setCommmentHistoryData((prevComments) => [...prevComments, newComment]);
        setNewCommentMessage('');
    };
    useEffect(() => {
        if (commentsContainerRef.current) {
            commentsContainerRef.current.scrollTop = commentsContainerRef.current.scrollHeight;
        }
    }, [CommmentHistoryData])
    
    return <div>
        <div className="bg-gray-300 dark:bg-gray-500 dark:text-gray-200 my-2 rounded-md overflow-y-auto " style={{ height: '10em' } } ref={commentsContainerRef} >
        {CommmentHistoryData.map((comment: CommentsHistory) => (
                    <div key={comment.id} className="p-2 border-b border-gray-400 last:border-b-0 ">
                        <p className="text-sm font-semibold dark:text-gray-100">{comment.name} 
                            <span className="dark:text-gray-300 text-gray-600 ml-2 text-xs">{comment.date}</span></p>
                        <p className="text-sm text-gray-800 mt-1 dark:text-gray-300">{comment.message}</p>
                        {/* <p className="text-xs text-gray-500">Case ID: {comment.caseid}</p> */}
                    </div>
                ))}
    </div>
        <div className="flex justify-between   gap-x-2">
            <div className="flex-1 ">
                <Input placeholder="Enter New Comment" value={newCommentMessage} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCommentMessage(e.target.value)}></Input>
            </div>
            <Button className="sm:w-auto" variant="outline-no-transparent" onClick={handleNewComment}> Comment</Button>
        </div>
    </div>;
}