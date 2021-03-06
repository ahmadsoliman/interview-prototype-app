import { Component, OnInit } from "@angular/core";
import { AuthService } from "@app/core/auth";
import { Store, Select } from "@ngxs/store";
import { Router } from "@angular/router";
import { AppState } from "@app/app.state";
import { Observable } from "rxjs";
import { UserInfo } from "@app/core/models";
import { Logout } from "@app/main/user/user.actions";

@Component({
  selector: "app-main-header",
  templateUrl: "./header.component.html"
})
export class HeaderComponent implements OnInit {
  @Select((state: AppState) => state.user.loggedInUser) user!: Observable<
    UserInfo
  >;

  items: any[] = [
    {
      text: "userName",
      items: [
        {
          text: "Profile",
          path: "/profile"
        },
        {
          text: "Logout",
          path: "/logout"
        }
      ]
    }
  ];

  constructor(
    public auth: AuthService,
    private readonly store: Store,
    private readonly router: Router
  ) {}

  ngOnInit() {
    this.user.subscribe(userInfo => {
      this.items[0].text = userInfo.firstName;
    });
  }

  public onSelect({ item }: any): void {
    if (item.path === "/logout") {
      this.store.dispatch(new Logout());
    } else if (item.path) {
      this.router.navigate([item.path]);
    }
  }
}
