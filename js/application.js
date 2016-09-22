/**
 * Created by lxl on 2016/8/19.
 */
window.requestAnimationFrame(function () {
    new GameManager(4,KeyboardInputManager,HTMLActuator,LocalStorageManager);
});