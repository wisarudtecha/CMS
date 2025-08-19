import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { useEffect, useRef, useState } from "react";
import { CaseHistory } from "@/store/api/caseApi";
import { usePostAddCaseHistoryMutation } from "@/store/api/caseApi"; // This should be a mutation hook

interface CommentsProps {
    comment?: CaseHistory[];
    caseId: string;
    currentUsername?: string;
    onCommentAdded?: () => void;
}

export const Comments: React.FC<CommentsProps> = ({
    comment,
    caseId,
    currentUsername = "Current User",
    onCommentAdded
}) => {
    const [newCommentMessage, setNewCommentMessage] = useState<string>('');
    const commentsContainerRef = useRef<HTMLDivElement>(null);
    const [commentsData, setCommentsData] = useState<CaseHistory[]>(comment || []);


    const [addCaseHistory, { isLoading, error }] = usePostAddCaseHistoryMutation();

    useEffect(() => {
        if (comment) {
            setCommentsData(comment);
        }
    }, [comment]);

    const handleNewComment = async () => {
        if (newCommentMessage.trim() === '') {
            return;
        }

        try {
            // Prepare the comment data
            const newCommentData = {
                caseId: caseId,
                fullMsg: newCommentMessage.trim(),
                jsonData: "",
                type: "comment",
                username: currentUsername
            };


            const result = await addCaseHistory(newCommentData).unwrap();
            setNewCommentMessage('');


            const optimisticComment: CaseHistory = {
                id: Date.now(),
                orgId: commentsData[0]?.orgId || "",
                caseId: caseId,
                username: currentUsername,
                type: "comment",
                fullMsg: newCommentMessage.trim(),
                jsonData: "",
                createdAt: new Date().toISOString(),
                createdBy: currentUsername
            };

            setCommentsData((prevComments) => [...prevComments, optimisticComment]);

            // Call the callback to refresh data from parent
            if (onCommentAdded) {
                onCommentAdded();
            }

            console.log('Comment added successfully:', result);

        } catch (err) {
            console.error('Failed to add comment:', err);
        }
    };

    useEffect(() => {
        if (commentsContainerRef.current) {
            commentsContainerRef.current.scrollTop = commentsContainerRef.current.scrollHeight;
        }
    }, [commentsData]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleKeyDownComment = (event: any) => {
        if (event.key === 'Enter') {
            handleNewComment()
        }
    };

    return (
        <div>
            <div
                className="bg-gray-100 dark:bg-gray-700 my-2 rounded-lg overflow-y-auto custom-scrollbar border border-gray-200 dark:border-gray-600 shadow-inner"
                style={{ height: '10em' }}
                ref={commentsContainerRef}
            >
                {commentsData.length === 0 && (
                    <div className="flex justify-center items-center h-full">
                        <div className="text-center">
                            <div className="text-gray-400 dark:text-gray-500 text-sm mb-1">
                                <svg
                                    className="mx-auto h-8 w-8 mb-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                    />
                                </svg>
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                                No comment history available
                            </p>
                            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                                Be the first to add a comment
                            </p>
                        </div>
                    </div>
                )}
                {commentsData.map((comment: CaseHistory) => (
                    <div
                        key={comment.id}
                        className="p-3 border-b border-gray-200 dark:border-gray-600 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-150"
                    >
                        <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                {comment.username}
                            </p>
                            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded-full">
                                {formatDate(comment.createdAt)}
                            </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
                            {comment.fullMsg}
                        </p>
                    </div>
                ))}
            </div>

            {/* Show error message if there's an error */}
            {error && (
                <div className="text-red-500 text-sm mb-2">
                    Failed to add comment. Please try again.
                </div>
            )}

            <div className="flex gap-3 mt-3">
                <div className="flex-1">
                    <Input
                        placeholder="Enter your comment..."
                        value={newCommentMessage}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCommentMessage(e.target.value)}
                        onKeyDown={handleKeyDownComment}
                        className="border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800"
                        disabled={isLoading}
                    />
                </div>
                <Button
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    variant="outline-no-transparent"
                    onClick={handleNewComment}
                    disabled={newCommentMessage.trim() === '' || isLoading}
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Adding...
                        </>
                    ) : (
                        <div className="flex text-gray-900 dark:text-gray-300">
                            <svg
                                className="w-4  mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                />
                            </svg>
                            <span>Comment</span>
                        </div>
                    )}
                </Button>
            </div>
        </div>
    );
};