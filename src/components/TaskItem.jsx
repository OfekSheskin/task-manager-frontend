

export default function TaskComponent(props){
    return (
    <div >
        <h3 onClick={()=> props.onSelect(props.taskId)}>{props.taskTitle}</h3>
        <p>{props.taskInfo}</p>
        <p>{props.createdAt}</p>

    </div>

)

}