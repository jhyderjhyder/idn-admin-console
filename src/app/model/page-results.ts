export class PageResults {
  public xTotalCount: number;
  private _currentPage: number = 0;
  public offset: number = 0;
  public limit: number = 5;
  public max = false;

  //private hasMorePages:boolean;
  public get showPreviousButton() {
    if (this._currentPage > 0) {
      return true;
    }
    return false;
  }

  public get hasMorePages() {
    //Somehow the number is sometimes string 1+ 1 = 11
    const cPage = this._currentPage + 1;
    //console.log(this.totalPages + "<=" + cPage);
    if (this.totalPages <= cPage) {
      return false;
    }
    return true;
  }
  public get totalPages() {
    return Math.ceil(this.xTotalCount / this.limit);
  }

  public paggination() {
    const array: number[] = Array();
    let i = this.currentPage;
    let count = 1;

    while (this.totalPages >= i && count < 10) {
      array.push(i);
      i++;
      count++;
      //TODO only show 10 pages
      if (i == 10) {
        //i = this.totalPages;
        this.max = true;
      }
    }

    return array;
  }

  public getPageByNumber(input) {
    this._currentPage = input;
    this.offset = input * this.limit;
  }

  public get nextPage() {
    if (this._currentPage <= this.totalPages) this._currentPage++;
    this.offset = this.offset + this.limit;
    return this.offset;
  }
  public get prevPage() {
    if (this.currentPage > 0) {
      this._currentPage--;
      this.offset = this._currentPage * this.limit;
    }
    return this.offset;
  }
  public get currentPage() {
    return this._currentPage + 1;
  }
}
