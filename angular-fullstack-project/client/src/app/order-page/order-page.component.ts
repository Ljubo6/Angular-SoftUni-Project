import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";
import {MaterialInstance, MaterialService} from "../shared/classes/material.service";
import {OrderService} from "./order.service";
import {Order, OrderPosition} from "../shared/interfaces";
import {OrdersService} from "../shared/services/orders.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-order-page',
  templateUrl: './order-page.component.html',
  styleUrls: ['./order-page.component.css'],
  providers: [OrderService]
})
export class OrderPageComponent implements OnInit,OnDestroy,AfterViewInit {
  @ViewChild('modal') modalRef!: ElementRef
  modal!: MaterialInstance
  oSub!: Subscription
  isRoot!: boolean
  pending = false

  constructor(private  router: Router,
              public order: OrderService,
              private orderService: OrdersService) {
  }

  ngOnInit(): void {
    this.isRoot = this.router.url === '/order'
    this.router.events.subscribe({
      next:event => {
        if (event instanceof  NavigationEnd){
          this.isRoot = this.router.url === 'order'
        }

      }
    })
  }
  ngOnDestroy() {
    this.modal.destroy?.()
    if (this.oSub){
      this.oSub.unsubscribe()
    }
  }

  ngAfterViewInit() {
    this.modal = MaterialService.initModal(this.modalRef)
  }

  open() {
    this.modal.open?.()
  }

  cancel() {
    this.modal.close?.()
  }

  submit() {
    this.pending = true
    const order: Order = {
      list: this.order.list.map(item => {
        delete  item._id
        return item
      })
    }

    this.oSub = this.orderService.create(order).subscribe({
      next: newOrder => {
        MaterialService.toast(`Order N${newOrder.order} added.`)
        this.order.clear()
      },
      error: error => {
        MaterialService.toast(error.error.message)
      },
      complete: () => {
        this.modal.close?.()
        this.pending = false
      }
    })
  }

  removePosition(orderPosition: OrderPosition) {
    this.order.remove(orderPosition)
  }
}
