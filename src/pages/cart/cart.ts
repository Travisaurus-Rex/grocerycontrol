import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Events } from 'ionic-angular';

import { trigger, state, style, transition, animate } from '@angular/animations'

@IonicPage()
@Component({
  selector: 'page-cart',
  templateUrl: 'cart.html',
  animations: [
  	trigger('visibility', [
  			state('hidden', style({
  				opacity: 0,
  				maxWidth: '1%'
  			})),
  			state('visible', style({
  				opacity: 1,
  				maxWidth: '50%'
  			})),
  			transition('* => *', animate('.1s'))
  		]),
  	trigger('shrinkage', [
  			state('stretch', style({
  				width: '99%'
  			})),
  			state('shrink', style({
  				width: '50%'
  			})),
  			transition('* => *', animate('.05s'))
  		]),
    trigger('slide', [
       state('fly', style({
         right: '-50px',
         opacity: 0
       })),
       state('slide', style({
         right: '24px',
         opacity: 1
       })),
       transition('* => *', animate('0.15s'))
      ])
  ]
})
export class CartPage {

	public items = [];
	public total: number;
	public newTotal: number;
  public itemsToRemove = [];

  public newTotalVisibility = 'hidden';
  public shrinkOrStretch = 'stretch';
  public slideOrFly = 'fly';

  constructor(
  	public navCtrl: NavController, 
  	public navParams: NavParams,
  	private storage: Storage,
    public events: Events
  ) { }

  ngOnInit() {
  	this.getItems();
  	this.getTotal();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CartPage');
  }

  getTotal() {
  	this.storage.get('grocery_list_total')
  		.then(total => {
  			this.total = total;
  			this.newTotal = this.total;
  		})
  }

  getItems() {

    let list;
    let itemsInCart = []; 

    this.storage.get('grocery_list_items')
      .then(listString => {

        list = (listString != null) ? JSON.parse(listString) : null;
        if (list) {
          list.forEach(item => { 
            if (item.inCart) itemsInCart.push(item);
          });
          this.items = itemsInCart;
        }
      })
  }

  hideAndShow() {
  	this.newTotalVisibility = (this.newTotalVisibility == 'hidden') ? 'visible' : 'hidden';
  	this.shrinkOrStretch = (this.shrinkOrStretch == 'stretch') ? 'shrink' : 'stretch';
    this.slideOrFly = (this.slideOrFly == 'fly') ? 'slide' : 'fly';
  }

  prepareToRemove(i) {

  	i.ifRemove = !i.ifRemove;

  	if /* we want to remove this item */ (i.ifRemove) {
      console.log(`pricePerUnit:  ${i.pricePerUnit}`);
      console.log(`Type:  ${typeof i.pricePerUnit}`);
      if (i.quantity == 1) {
        this.newTotal -= i.price;
      } else {
        this.newTotal = this.newTotal - (i.pricePerUnit * i.quantityToRemove);
      }

  		this.itemsToRemove.push(i);

  		if (this.newTotalVisibility != 'visible' && this.newTotal!= this.total) {
  			this.hideAndShow();
  		}

  	} else /* if we don't want to remove this item */ {
      
  		this.itemsToRemove.forEach((item, index) => {
  			if (item.name == i.name) {
  				this.itemsToRemove.splice(index, 1);
  			}
  		})
      
      if (i.quantity > 1) {
        this.newTotal = this.newTotal + (i.pricePerUnit * i.quantityToRemove);
        i.quantityToRemove = 1;
      } else {
        this.newTotal += i.price;
      }

      this.newTotal = Math.round(this.newTotal * 100) / 100;

      if (this.newTotal == this.total) {
        this.hideAndShow();
      }
  	}
  	this.newTotal = Math.round(this.newTotal * 100) / 100;
  }

  changeQuantity(i, method) {
    i.pricePerUnit = Math.round(i.pricePerUnit * 100) / 100;
    if (method == 'reduce') {
      if (i.quantityToRemove > 1) i.quantityToRemove--;
      this.newTotal += i.pricePerUnit;
    } else {
      if (i.quantityToRemove < i.quantity) i.quantityToRemove++;
      this.newTotal -= i.pricePerUnit;
    }
  }

  removeItems() {

  	this.total = this.newTotal;
    this.total = Math.round(this.total * 100) / 100;
  	this.hideAndShow();

  	let storageItems;

  	this.storage.get('grocery_list_items')
  		.then(data => {
  			storageItems = JSON.parse(data);

  			this.itemsToRemove.forEach((itemToRemove, i_index) => {
		  		this.items.forEach((i, j_index) => {
		  			if (itemToRemove.name == i.name) {
              if (itemToRemove.quantity == itemToRemove.quantityToRemove) {
                this.items.splice(j_index, 1);
              } else {
                let { quantity: x, quantityToRemove: y} = i;
                this.items[j_index].quantity = x - y;
                this.items[j_index].quantityToRemove = 1;
                this.items[j_index].price = (x - y) * this.items[j_index].pricePerUnit;
              }
		  			}
		  		})

		  		storageItems.forEach((i, index) => {
		  			if (itemToRemove.name == i.name) {
              if (itemToRemove.quantity == itemToRemove.quantityToRemove) {
		  				  storageItems.splice(index, 1);
              } else {
                itemToRemove.ifRemove = false;
                storageItems[index] = itemToRemove;
              }
		  			}
		  		})
		  	}
        )

		  	let itemsToStore = JSON.stringify(storageItems);
		  	let newTotal = JSON.stringify(this.newTotal);

		  	this.storage.set('grocery_list_items', itemsToStore);
		  	this.storage.set('grocery_list_total', newTotal);

        this.itemsToRemove = [];
        this.items.forEach(i => {
          i.ifRemove = false;
        })
  		})
      this.events.publish('total:updated', this.total);
  }

}
