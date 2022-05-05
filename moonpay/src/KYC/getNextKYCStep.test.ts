import getNextKYCStep from "./getNextKYCStep";
import { setFetchReturn } from "../utils/fetch";

jest.mock("../utils/fetch");

const limitAPISampleResponse =
  '{"limits":[{"type":"buy_credit_debit_card","dailyLimit":58.89,"dailyLimitRemaining":58.89,"monthlyLimit":176.68,"monthlyLimitRemaining":176.68},{"type":"buy_gbp_bank_transfer","dailyLimit":58.89,"dailyLimitRemaining":58.89,"monthlyLimit":176.68,"monthlyLimitRemaining":176.68},{"type":"buy_sepa_bank_transfer","dailyLimit":58.89,"dailyLimitRemaining":58.89,"monthlyLimit":176.68,"monthlyLimitRemaining":176.68}],"verificationLevels":[{"name":"Level 1","requirements":[{"completed":true,"identifier":"identity_verification"}],"completed":true},{"name":"Level 2","requirements":[{"completed":false,"identifier":"document_verification"},{"completed":false,"identifier":"face_match_verification","showLivenessCheck":true}],"completed":false},{"name":"Level 3","requirements":[{"completed":false,"identifier":"address_verification"}],"completed":false}],"limitIncreaseEligible":true}';
test("requests where amount is slightly higher than 50 EUR lead to document upload (extended KYC)", async () => {
  setFetchReturn(limitAPISampleResponse);
  const highAmount = await getNextKYCStep(
    {
      PK: "tx#123",
      paymentMethod: "creditCard",
      fiatAmount: 60,
    } as any,
    "sumAuthToken",
    { address: { country: "ESP" } } as any,
    "pk_test_aaaaa"
  );
  expect(highAmount.type).toBe("pickOne");
  expect(highAmount).toMatchInlineSnapshot(`
    Object {
      "options": Array [
        Object {
          "description": "Front",
          "icon": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAASwSURBVHgBvVhLbBNHGP5nvFErkdhrVSoStNSNVCQQaZJeWvWhbJF6qVqppRd6oE1OTS9N0gM90CpGLZWaHnAiDr3RXsoJIYHgwgEjgQAhQRCQnACHx4ED8gskEPYO/zf2mmDv2uvZ4E9ae7Qzu/Pt/55fkCHyeeVIi4YVKYcUjZAgm2/b9ekCXzlcylVXyJXZZFJkyQCim8VMymZSU0xqehWZsDvlBIms+5T2Mtlc+MfCEovRrBKaWGQIIf4NS7QjwWJZQWJp6lZinXfOSRLpeL/4r/2yNiiW1P61klogASEyiX4xEzjvdxMqFZY6wkOHeoNFVRGfssoLzRPSb7XoU6eod+SAkbpAWtBCEGrVYaP3cIoPee8mvKDifKkyLoQ86Pf0Pwfv0dzCbf6ACkXBpjdepR/GN9DkxEbfeY6bM8lELNNCkO0upVWrKNX80O27j2l07CJ99H5CX1FwbfkRnTj5gI7+/27Quwpsj2979mg1bsfcNCmR8nvi0OH7+v/A3GYtgSiABgZHz9GZ84Uggrbso1n+n2kQ1NIT6vtOLw8ih02Ps1Sus3TiAzG97vPPXqNE3GpZ63evGUqpaeaEQF6orYb0ust6DUC6e/642SDqASR3/7SJvv1mPRlBuoi/aU1QSDHGtmdM7s9fB+nMhaK+BwldXXqoie35vUbchCRzmgJBiarEzzE6AY4Dr97H5D5kWwJZSAzXWSYL+9r326D+AEPPt/Plp45kUTpkgLN1iUE6HiGoFRLEGJ6KuW1b1jWcrGu4csRiUQ6TAaDGeDxGf82vaILFckWPAUgMBPGP69rSIzKCEA5sMEUGwMalUpXu3H1CpfLzMVAqV/ndVJ+rUjwRIxMIScPSlODQ1n56c+MrdODvzbRzx/rGGBfGuOeNh7b0kxEUx0QyrPNgX1Bdzf7smppZqnAejBEHYXvIHBGyj905agYAzrB76i3aNbnEGeYdTWJuYYWDLOkxiMKDf+E1UbIPCCLnGUlxcmKDtr9dk8uahOfZGH/347Imh8IgAjiTKCYozMt5xL2dO17XXut567at67QJhElr7SFyFpNbJENH8QCJBZVPUcA5ecXi+us0x8KvyBCIh+0yBaQIjzeCUosWZxKWoFmcusoqdb683HbNEKs7e+w9MoJ0s1ZyoC9bKLtGjoLNUXi2A1KdERTlkvG+rLZiVvM8q3mWDIDCsx0QboxKLllrldTczJUZkqprglAxKpp2gAOZEFTceWgQROWaL1fnuXcy1c1LoOIHNz6hNQe3Rry2yPNjZ0WmqRa0fYjUvBAnu6jw3hGYXRTd8qSnua6eyxer02yL+/2eG/viks6rawGkwiDn4lbIeGJVv6blIMKqzgSpGtkCcS8KPv7ADiweuEmVSQ7EXujT+J6UOOz0uvUBXLYHZEvA9O3N8MH5a/5bpN7hFO+53W/ClyC8mr9mlEU+Ty8XCmrlvbb7dbYoiKAHtodppdwJRHVac2qU597jz80214ywLeAUDvfsYR27D2Goac1U5N4gqVG3BD00iBIf9EXoEk3VfwsssQUmlglDzIjgauBQzSnSqR9bU/rw7xW+Sgf8PGpN/pjTLlWuoCghAzwDSToFeiZx90AAAAAASUVORK5CYII=",
          "nextStep": Object {
            "acceptedContentTypes": Array [
              "image/jpeg",
              "image/png",
              "application/pdf",
            ],
            "humanName": "Passport",
            "type": "file",
            "url": "https://upload.staging.onramper.tech/Moonpay/passport/123/ESP/sumAuthToken/front",
          },
          "title": "Passport",
        },
        Object {
          "description": "Front",
          "icon": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAATXSURBVHgBxVhNaFxVFD73zRsqmpk3YwWhaeKoIDS0JhXUQoSOgWyy8HdVRUxWZiFN4iILXSSFbuymk+KiuyqCXangIgsVOkGCRBdNbWhB0E7TZqFY56+Flkze7fnu5E5nJu/nzkyYfPByc++ce+/3zjn3vHOPoDaRz8u0ZdOgJJkmSUMkKMHDie2fC/zk8EhXXiHXyiaTIkttQLQizKQSTGqKSU3XkTHdKSdIZN1NOsVkc+bTTIlFaE4KRaxjCCG+NCUaSrBYltDYPLWqsfCdcxaJ+XiP+CpYLADFkjy7W1rzJSBExukRM76/ew3CpMKW3/O/aeoOVmVFvM4mLzT/YHlJi6i8RN0jBwxtK2QHdhCEWVXY6D7Sxbu8dxMaTJwvVcaFsC7QHoLj5kzSiWR0v0aQ/S6lTCspRXuLAvvjs9of7dpwxJ0nKVImKxRLFTp/YYMufvdvqKwTj9CRQz00e7Kf+g8+RgZIWFGa41adbKVBpT1b3iBDHD3+O63fvk8n3nm6YXzxpzvkODYNv+LUxorlihoHuctLL5tuQazFJLRY1SC0Z/jVu/jtP4rcF2deoBPvVgmi/9npv9US0O76xn36+vwAa6+6/PJKkd547w8m+h+NjT5ltA9ZLuLvvDrFwhLHyRDYDBtrcgD6IHb40BPq0X2N4VcdcmI2Lf74v+k24DSF1kZWQlKmTCdevXZPkagHCP3wzYuB84aPJWj5tyK1gES+vJm2WJVpE2kcCphp7fpdpZFWcXjgceUKWANrGcG1hixW5aCZtKiZ7bVjrecNOMnArY0H+P6aTRIiDR9MmchOThyo+V2ziU2gtf7R+AH1GPGzaNA2JQgsr5SUv30weY3aBQ7Z5ESvmbDkmEiGed7n526qMBGP29QuEAsRE419kLmJQtmVJpL7n/9FmRjxrxN8PPunIomg7Ri8LDRYCBNCaAHGRp+kTgFfxGGrj5MB4C+JZIIi2MzF8qZqnXhUtTARtKAxNrp/h1/5yfQd3Kf6OM3h32aBawGthkhRqbSl2ngsoic2LuMZNrxl+nurpBATwyClvGlz/rXEsfCtIEG9mH5jhBw8QfCT0X5nZGIpV/ElCdWgXszp4ARrtETQcrN2MhbN8knGQfH1Q2jQy18wfmZhXWUvXsAcrzywj/u3bj+gQEjKJePRrMpm2MwLQbJw6L7efTvG33z/Ki3+fMd3HoIyZJqBzAZ5YiCsaqmkqm/XypAl5/xkcXqXVxqjEU4oNIgsxi950Hkg2nqZUhlhJkJBkFx5QPvoTlLeynDtZCpoI5hKa3Lt+j3lT2FZ8nNDv6osu34e/A8JLUKPJ7g0kugRE40Eq5d1pP2evgiNIZuuPzCzJ5+hIwPBicMaB/lPT/9V62Me4qFvyibphtwSI7pu03jtLG5Nc8g5S3sIjpfjTl29puHijvsoF4oWaI/Ae2ecpmKSZ+bIYafbpQ/gciJmvdQ86Fmb4Svf29yEBvBdxCXec8TrB0+CuI/y2xztgrklzMp7jXhVtsiPoEYyFpmW0p1AVKddp0Z5rj1+wnvMBImZloBTuNzzCfuQOodUlqlYp/y0Rq0S1KgRJb7oC+O7jNz+W2CNnWNiGRNibRGsBy7V/IlMb19bU6oqphNfNh+RSoRX+WWWXKpcQVJCbeAhY8/+FsOCb8UAAAAASUVORK5CYII=",
          "nextStep": Object {
            "acceptedContentTypes": Array [
              "image/jpeg",
              "image/png",
              "application/pdf",
            ],
            "humanName": "Driver's License",
            "type": "file",
            "url": "https://upload.staging.onramper.tech/Moonpay/driving_licence/123/ESP/sumAuthToken/front",
          },
          "title": "Driver's License",
        },
        Object {
          "description": "Front",
          "icon": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAUhSURBVHgBxVhdaFxFFD5zc2OFZv+o6EPcsLEgGNomKUjAQnsN9iVaf/BJRWzfBH+S+JBSWnEDiQ996VoE+9ZKaXyyUrX1oYFuMIKxQrYmpKDibpPug9p2/1Jom907Pefs3s3u9u69d++GzQeTuZk5s/PNOWfOnBkBLpFKSU1RoVeC1EBCHwjwY7O/1J3GkqAidXkNdCUaCIgouIBoRBhJ+ZHUMJIaqSDjdKaEABHV12AcySacD3NKrA0+k4KJNQ0hxBmnRG0JZnKSNBaGRjVmP3NCARH2doivrcUskMnKExultboEhIj4OsRo3X6zRjKpUOV3+KlBaxCTefEimjxd26GYSYt2eQVaR47QV1LII3iEIJmVw0broWVWce4aVJk4lc0fFEI5DZsIjJujAV9bxPi/TBD9LsSmlRCy+5HZX9Pw0/QdWL55DzWet5T1eVXoevpxeGHACy/vfwIcII3+2G344zrBbOEM7qj3wIbYR4f/YmI0sZcm79xiNYQXsHj9Ln8T0cljz8DQ/m2WYyp3NhNk7akybjXo0uXb8O77S7CzZytOsh32DPigEdD4oxP/8OK+n9plOx61GCAtFgk60F7/vqtcR3/oZ+25AWnz1bf/gGyuAPMzz1vKoi+Ooy+GeRcLReyzEqbV08onj3W7JkegsZ9/up1/65e5jKUschqmWqWsBKQMWQmT7xGG6jg5aebU6ST7Gn2/9eZTbELyuVpQu8+jwsXLt+zM7E/l1jQVFF2zO5JXkg/Y98xA2njtnQWudzy3lbX04difTO7CuZ2mJL0+FVZu3gdb6EqfiqrstZPLZNfA6zE3LZEjVDo+kdVemWei1F4L2vl24YkhhEY+GAKXWFi6y2TGPu6qMhdpbWy4i/1sYWkV3EIo0NsUwZXkPa7JtLXYM1DMzowY6AoS/ETQdZ4X7Cz6l0G0EovXi5oz88EG4FegCdDGIQJHJ+JsagP0ffzkMvc1GtBrQZ5PMcS1Fs9+1cPBlzYL72LcTJemb3PfhXO7oEmkFbRzGprADtRi9Md+1tQC+tvsbxkYemkbnzj1QpNziISKITAGTWwUApnyy+PPwkZDSnlDxTNvBmPh61aCPm972elrQfHsm2//hUUKOaXNQsGaMhYqZkdjJlvARVlnQSWGMQVPkpidXLDzMdPASscbJRGUpZBpDVBooSCtHZhn8rWgxQadEFT0KNfpnJ7CIuuVi9Mp2fbkDNdG25HJOLftPRCrajfK7FyO+0jmyES83D51/n9umzr/n7SaM53V19O/VKYQthTG0r17TvZqv8sbyQfy57ksT/LB4b+l3TiSMRZHY+l3qNiNS69KvnoYCStdM1NW2qZji8IJbYggnqUryfu2OR2BXKN/71UIBrfwZHQ8nj3VY5tVl9L+xHrKnytE8O1k2GpQZVZMoBDj81jnh8u4kCySJKLGbrcN3vg04u8Qh/izTLCoRbK7bdAmoqTRRi5NpDFHp4qEuCyIQePdpvramSmMYMg5AZsIvHoc9FW811SdxXQfxYeiL2CTgHNHfDWPSaapNO6iVj99EOb9HmV3baNpNoM76A2sbAP4BuIKzjlo1mFKkO6juJr+FphbkllxrkGzly2oR9BAwNM2IqV+CJ0jARtODVL49vgJzjFqJeb0CTgEbXrY7nLvlBpbJq+M19MaNErQQJko4EVfOE7RZOlvGjV2EolFnBBzRbASdKnGe6tWuraG+FVMlII8mg8oU8dcExczo0P+WsDTHgUXeAgIvghCFzTzgQAAAABJRU5ErkJggg==",
          "nextStep": Object {
            "acceptedContentTypes": Array [
              "image/jpeg",
              "image/png",
              "application/pdf",
            ],
            "humanName": "National Identity Card",
            "type": "file",
            "url": "https://upload.staging.onramper.tech/Moonpay/national_identity_card/123/ESP/sumAuthToken/front",
          },
          "title": "National Identity Card",
        },
        Object {
          "description": "Front",
          "icon": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAUhSURBVHgBxVhdaFxFFD5zc2OFZv+o6EPcsLEgGNomKUjAQnsN9iVaf/BJRWzfBH+S+JBSWnEDiQ996VoE+9ZKaXyyUrX1oYFuMIKxQrYmpKDibpPug9p2/1Jom907Pefs3s3u9u69d++GzQeTuZk5s/PNOWfOnBkBLpFKSU1RoVeC1EBCHwjwY7O/1J3GkqAidXkNdCUaCIgouIBoRBhJ+ZHUMJIaqSDjdKaEABHV12AcySacD3NKrA0+k4KJNQ0hxBmnRG0JZnKSNBaGRjVmP3NCARH2doivrcUskMnKExultboEhIj4OsRo3X6zRjKpUOV3+KlBaxCTefEimjxd26GYSYt2eQVaR47QV1LII3iEIJmVw0broWVWce4aVJk4lc0fFEI5DZsIjJujAV9bxPi/TBD9LsSmlRCy+5HZX9Pw0/QdWL55DzWet5T1eVXoevpxeGHACy/vfwIcII3+2G344zrBbOEM7qj3wIbYR4f/YmI0sZcm79xiNYQXsHj9Ln8T0cljz8DQ/m2WYyp3NhNk7akybjXo0uXb8O77S7CzZytOsh32DPigEdD4oxP/8OK+n9plOx61GCAtFgk60F7/vqtcR3/oZ+25AWnz1bf/gGyuAPMzz1vKoi+Ooy+GeRcLReyzEqbV08onj3W7JkegsZ9/up1/65e5jKUschqmWqWsBKQMWQmT7xGG6jg5aebU6ST7Gn2/9eZTbELyuVpQu8+jwsXLt+zM7E/l1jQVFF2zO5JXkg/Y98xA2njtnQWudzy3lbX04difTO7CuZ2mJL0+FVZu3gdb6EqfiqrstZPLZNfA6zE3LZEjVDo+kdVemWei1F4L2vl24YkhhEY+GAKXWFi6y2TGPu6qMhdpbWy4i/1sYWkV3EIo0NsUwZXkPa7JtLXYM1DMzowY6AoS/ETQdZ4X7Cz6l0G0EovXi5oz88EG4FegCdDGIQJHJ+JsagP0ffzkMvc1GtBrQZ5PMcS1Fs9+1cPBlzYL72LcTJemb3PfhXO7oEmkFbRzGprADtRi9Md+1tQC+tvsbxkYemkbnzj1QpNziISKITAGTWwUApnyy+PPwkZDSnlDxTNvBmPh61aCPm972elrQfHsm2//hUUKOaXNQsGaMhYqZkdjJlvARVlnQSWGMQVPkpidXLDzMdPASscbJRGUpZBpDVBooSCtHZhn8rWgxQadEFT0KNfpnJ7CIuuVi9Mp2fbkDNdG25HJOLftPRCrajfK7FyO+0jmyES83D51/n9umzr/n7SaM53V19O/VKYQthTG0r17TvZqv8sbyQfy57ksT/LB4b+l3TiSMRZHY+l3qNiNS69KvnoYCStdM1NW2qZji8IJbYggnqUryfu2OR2BXKN/71UIBrfwZHQ8nj3VY5tVl9L+xHrKnytE8O1k2GpQZVZMoBDj81jnh8u4kCySJKLGbrcN3vg04u8Qh/izTLCoRbK7bdAmoqTRRi5NpDFHp4qEuCyIQePdpvramSmMYMg5AZsIvHoc9FW811SdxXQfxYeiL2CTgHNHfDWPSaapNO6iVj99EOb9HmV3baNpNoM76A2sbAP4BuIKzjlo1mFKkO6juJr+FphbkllxrkGzly2oR9BAwNM2IqV+CJ0jARtODVL49vgJzjFqJeb0CTgEbXrY7nLvlBpbJq+M19MaNErQQJko4EVfOE7RZOlvGjV2EolFnBBzRbASdKnGe6tWuraG+FVMlII8mg8oU8dcExczo0P+WsDTHgUXeAgIvghCFzTzgQAAAABJRU5ErkJggg==",
          "nextStep": Object {
            "acceptedContentTypes": Array [
              "image/jpeg",
              "image/png",
              "application/pdf",
            ],
            "humanName": "Residence Card",
            "type": "file",
            "url": "https://upload.staging.onramper.tech/Moonpay/residence_permit/123/ESP/sumAuthToken/front",
          },
          "title": "Residence Card",
        },
      ],
      "title": "Choose identity document",
      "type": "pickOne",
    }
  `);
  setFetchReturn(limitAPISampleResponse);
  const lowAmount = await getNextKYCStep(
    {
      PK: "tx#123",
      paymentMethod: "creditCard",
      fiatAmount: 40,
    } as any,
    "",
    { address: { country: "ESP" } } as any,
    "pk_test_aaaaaa"
  );
  expect(lowAmount.type).toBe("iframe");
  expect(lowAmount).toMatchInlineSnapshot(`
    Object {
      "fullscreen": false,
      "type": "iframe",
      "url": "https://moonpay.sandbox.staging.onramper.tech?customerId=undefined&customerAddress=eyJjb3VudHJ5IjoiRVNQIn0=&transactionId=123&apiKey=pk_test_aaaaaa",
    }
  `);
});
