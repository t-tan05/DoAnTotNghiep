import { createRole, findByRoleName } from "#models/role.model";
import AppError from "#utils/AppError";

//Hàm tạo role tầng service
export const createRoleService = async(roleName: string, description: string) => {
    //Chuẩn hóa roleName trước khi xử lý
    const roleUpperCase = roleName.toUpperCase();

    //tạo biến existedRole để xem roleName đã tồn tại chưa
    const existedRole = await findByRoleName(roleUpperCase);

    //Kiểm tra roleName nếu tồn tại thì báo lỗi
    if(existedRole) throw new AppError(`Hiện tại role ${roleUpperCase} đã tồn tại`, 409);

    //Tạo biến newRole chứa dữ liệu trả về sau khi tạo thành công
    const newRole = await createRole(roleUpperCase, description);

    return {newRole};
}