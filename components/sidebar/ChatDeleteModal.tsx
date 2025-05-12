import Modal from "../Modal";

type ChatDeleteModalProps = {
  isOpen:boolean,
  onClose:()=>void,
  chatTitle:string|undefined,
  deleteChat:()=>void,
  isDisable:boolean,
}
export default function ChatDeleteModal({isOpen, onClose, chatTitle, deleteChat, isDisable}:Readonly<ChatDeleteModalProps>){

  return(
      <Modal
        isOpen={isOpen}
        title="Delete Chat"
        onClose={onClose}
        
      >
        <div>Are you sure to delele chat <b>{chatTitle}</b>?</div>
        <div className="flex justify-end mt-4">
          <button 
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded"
            onClick={deleteChat}
            disabled={isDisable}
          >
            {isDisable?
              "Deleting...":"Delete"
            }
          </button>
        </div>
      </Modal>
  )
}
