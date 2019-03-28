# [ABPro.jp](https://abpro.jp)

## 更新方法

1. フォルダを用意します（例：2017）
2. [`static`][static-folder] に移動します
3. [**Upload files** を選択します][upload-files]
   - ![スクショ](https://gyazo.com/c086aa991601ff4ba5266b97034ff6ba.png)
4. フォルダごとドラッグ&ドロップする
5. **Commit changes** を押す

[static-folder]: https://github.com/MiyashitaLab/abpro.jp/tree/master/static
[upload-files]: https://github.com/MiyashitaLab/abpro.jp/upload/master/static

## トラブルシューティング

- **Q.** アップロードしたのに変更されない
  - **A.** [Commits][commits] を見てみましょう
    - 緑色のチェック ✔ がある → 更新されています
    - 黄色の丸 ● がある → 更新中です，待ちましょう
    - 赤色のバツ ❌ がある → エラーです
- **Q.** トップページが昔のページにリダイレクトされる
  - **A.** [`static/_redirects` を編集してください][edit-redirects]

[commits]: https://github.com/MiyashitaLab/abpro.jp/commits/master
[edit-redirects]: https://github.com/MiyashitaLab/abpro.jp/edit/master/static/_redirects
