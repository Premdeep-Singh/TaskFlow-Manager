package com.taskhub.web;

import com.taskhub.model.User;
import com.taskhub.repo.sql.UserRepo;
import com.taskhub.security.JwtService;
import com.taskhub.web.Dtos.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserRepo users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    @PostMapping("/register")
    public AuthRes register(@Valid @RequestBody RegisterReq r) {
        String email = r.email().trim().toLowerCase();
        if (users.existsByEmailIgnoreCase(email)) throw new ApiException(409, "An account with this email already exists");
        User u = new User();
        u.setName(r.name().trim());
        u.setEmail(email);
        u.setPasswordHash(encoder.encode(r.password()));
        return respond(users.save(u));
    }

    @PostMapping("/login")
    public AuthRes login(@Valid @RequestBody LoginReq r) {
        User u = users.findByEmailIgnoreCase(r.email().trim())
                .filter(x -> encoder.matches(r.password(), x.getPasswordHash()))
                .orElseThrow(() -> new ApiException(401, "Incorrect email or password"));
        return respond(u);
    }

    private AuthRes respond(User u) {
        return new AuthRes(jwt.create(u.getId()), new UserRes(u.getId(), u.getName(), u.getEmail()));
    }
}
