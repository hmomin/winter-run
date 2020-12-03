import { Router } from "@angular/router";
import { Component } from "@angular/core";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.css"],
})
export class AppComponent {
    title = "Winter Run";

    constructor(private router: Router) {}
}
