# Unreal EngineでのPixel Streamingプロジェクトの作成方法

## Summary
- EKSで利用するためのPixel Streamingプロジェクトのビルド手順書

## 前提
- OS : Windows
- UnrealEngine(UE) : 5.0.3

## UEのダウンロード、プロジェクトの作成
- Epic Games Launcherをダウンロードし起動、Unreal Engine > Libraryを選び、ENGINE VERSIONSの右の「+」をクリックしてダウンロードしたいバージョンを選ぶ
- ダウンロードが終わったら、Unreal Engineを起動し、Pixel Streamingするプロジェクトを作成する、今回はデフォルトプロジェクトの「Third Person」を選び作成

### 参考
- https://www.unrealengine.com/en-US/download
- https://docs.unrealengine.com/5.0/en-US/creating-a-new-project-in-unreal-engine/

## Pixel Streaming向けビルド
- Edit > Pluginsを選択
    - Pixel Streamingプラグインを選択し、Unreal Engineを再起動する
- Edit > Editor Preferences...を選択
    - Level Editor > Playカテゴリで、Additional Launch Parametersに以下の値を設定
        - ``` -AudioMixer -PixelStreamingIP=localhost -PixelStreamingPort=8888 ```

### 参考
- https://docs.unrealengine.com/5.0/en-US/getting-started-with-pixel-streaming-in-unreal-engine/

## Linux向けクロスコンパイル
- Linux向けクロスコンパイルのためにclangをダウンロード、インストールする
    - UEのバージョンによって必要となるclangのバージョンが異なる、5.0.3の場合はlang-13.0.1-basedを利用
        - https://cdn.unrealengine.com/CrossToolchain_Linux/v20_clang-13.0.1-centos7.exe
- ダウンロード、インストールした後UEを再起動すると、UEでPlatformsからLinuxが選択できるようになり、Linux向けビルドが行えるようになっている

### 参考
- https://docs.unrealengine.com/5.1/en-US/linux-development-requirements-for-unreal-engine/

## (Optional)コントローラーを表示させる方法、表示、非表示の変更

- コントローラーの表示
    - UEのメニューからEdit > Project Settings > Inputを選択
    - MobileのAlways Show Touch Interfaceにチェックを入れることでコントローラーが表示される
    - Mouse PropertiesのUse Mouse for Touchもチェックを入れておくとマウスでデバッグができる
- 表示の切り替え方法
    - Activate Touch interfaceを利用する
        - https://docs.unrealengine.com/5.0/en-US/BlueprintAPI/Game/Player/ActivateTouchInterface/
    - Player ControllerのメソッドなのでGet Player Controllerで、Player Controllerから呼び出す
    - New Touch Interfaceに設定するコントローラーを設定するが、デフォルトのままだと、UEデフォルトのコントローラーを設定することができない(Content Drawerに表示されていないので)、Engine組み込みのAssetを見えるようにするにはContent Drawerの設定からShow Engine Contetにチェックを設定する、これでUE組み込みであるDefaultVirtualJoyStickが表示できるようになる
    - 表示したいときには表示するNew Touch Interfaceを設定、消したいときにはNew Touch Interfaceに何も設定しない
    - 例
        - ![](./images/DocForUnrealEngine.png "")
