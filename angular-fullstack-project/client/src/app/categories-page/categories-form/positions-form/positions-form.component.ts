import {AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {PositionService} from "../../../shared/services/position.service";
import {Position} from "../../../shared/interfaces";
import {MaterialInstance, MaterialService} from "../../../shared/classes/material.service";
import {FormGroup,FormControl,Validators} from "@angular/forms";

@Component({
  selector: 'app-positions-form',
  templateUrl: './positions-form.component.html',
  styleUrls: ['./positions-form.component.css']
})
export class PositionsFormComponent implements OnInit, AfterViewInit,OnDestroy {
  @Input('categoryId') categoryId?: string
  @ViewChild('modal') modalRef!: ElementRef
  positions: Position[] = []
  loading = false
  positionId?: string | null
  modal!: MaterialInstance
  form!:FormGroup
  constructor(private positionService: PositionService) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      name: new FormControl(null,Validators.required),
      cost: new FormControl(1,[Validators.required,Validators.min(1)])
    })

    this.loading = true
    this.positionService.fetch(this.categoryId).subscribe({
      next: positions => {
        this.positions = positions
        this.loading = false
      }
    })
  }
  ngOnDestroy() {
    this.modal.destroy?.()
}

  ngAfterViewInit() {
    this.modal = MaterialService.initModal(this.modalRef)
  }

  onSelectPosition(position: Position) {
    this.positionId = position._id
    this.form.patchValue({
      name: position.name,
      cost: position.cost
    })
    this.modal.open?.()
    MaterialService.updateTextInputs()
  }

  onAddPosition() {
    this.positionId = null
    this.form.reset({
      name: null,
      cost: 1
    })
    this.modal.open?.()
    MaterialService.updateTextInputs()
  }
  onDeletePosition(event: Event,position: Position) {
    event.stopPropagation()
    const decision = window.confirm(`Delete position "${position.name}"?`)
    if (decision){
      this.positionService.delete(position).subscribe({
        next: response => {
          const idx = this.positions.findIndex(p => p._id === position._id)
          this.positions.splice(idx,1)
          MaterialService.toast(response.message)
        },
        error: error => {
          MaterialService.toast(error.error.message)
        }
      })
    }
  }
  onCancel() {
    this.modal.close?.()
  }
  onSubmit() {
    this.form.disable()

    const newPosition: Position = {
      name: this.form.value.name,
      cost: this.form.value.cost,
      category: this.categoryId
    }
    const completed = () => {
      this.modal.close?.()
      this.form.reset({name: '',cost: 1})
      this.form.enable()
    }
    if (this.positionId){
      newPosition._id = this.positionId
      this.positionService.update(newPosition).subscribe({
        next: position => {
          const idx = this.positions.findIndex(p => p._id === position._id)
          this.positions[idx] = position
          MaterialService.toast('Updates has been saved')
        },
        error: error => {
          MaterialService.toast(error.error.message)
        },
        complete: completed
      })
    }else{
      this.positionService.create(newPosition).subscribe({
        next: position => {
          MaterialService.toast('Position has been created')
          this.positions.push(position)
        },
        error: error => {
          MaterialService.toast(error.error.message)
        },
        complete: completed
      })
    }
  }
}
