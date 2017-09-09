import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { TotalService } from '../../services/total.service';
import { ViewController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

@IonicPage()
@Component({
  selector: 'page-add-item',
  templateUrl: 'add-item.html',
})
export class AddItemPage {
  public total: number;
	public item;
	public price:    number;
	public quantity: number = 1;
	public weight:   number;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public totalService: TotalService,
    public viewCtrl: ViewController,
    public storage: Storage
    ) {
  }

  ngOnInit() {
    let { item, total } = this.navParams.data;
    this.total = total;
    this.item  = item;
  }

  close() {
    this.viewCtrl.dismiss();
  }

  fixQuantity() {
    if (this.quantity == undefined) this.quantity = 1;
    console.log(typeof this.quantity);
  }

  addToCart() {
  	let i = this.item;
  	let p = this.price;

    if (typeof p === 'string') {
      p = parseFloat(p);
    }

    if (typeof this.quantity === 'string') {
      this.quantity = parseInt(this.quantity);
    }

    p = Math.round(p * 100) / 100;

  	p *= this.quantity;

  	if (this.weight != undefined) p = this.price * this.weight;

    p = Math.round(p * 100) / 100;

    i.price = p;
  	i.pricePerUnit = this.price;
  	i.quantity = this.quantity;
  	i.weight   = this.weight;
  	i.inCart   = true;

    this.total += p;
    this.updateStorage(i);
    this.totalService.setTotal(this.total);
    let t = this.total;

    let data = {total: t, item: i};

    this.viewCtrl.dismiss(data);
  }

  updateStorage(item) {
    this.storage.get('grocery_list_items')
      .then(data => {
        data = JSON.parse(data);
        data.forEach((i, index) => {
          if(i.name == item.name) {
            data[index].price    = item.price;
            data[index].quantity = item.quantity;
            data[index].weight   = item.weight;
            data[index].inCart   = true;
            data[index].pricePerUnit = item.pricePerUnit;
          }
          let dataString = JSON.stringify(data);
          this.storage.set('grocery_list_items', dataString);
        })
      })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AddItemPage');
  }

}
