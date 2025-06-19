interface  Case {
    id: string
    title: string
    description?: string
    status?: string
    priority: number
    assignee: string;
    dueDate: string
    comments: number
    category: string
    customer: string
}

export default Case