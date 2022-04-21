import {ElementRef} from "@angular/core";

declare let M: {
  FloatingActionButton: any;
  toast: (arg0: { html: string }) => void
  updateTextFields(): void;
}
export class MaterialService{
  static  toast(message: string){
    M.toast({html: message})
  }
  static  initializeFloatingButton(ref: ElementRef){
    M.FloatingActionButton.init(ref.nativeElement)
  }
  static updateTextInputs(){
    M.updateTextFields()
  }
}
